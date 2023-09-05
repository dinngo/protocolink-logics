import { BigNumberish, providers, utils } from 'ethers';
import {
  Config,
  SwapTokenLogicFields,
  SwapTokenLogicOptions,
  SwapTokenLogicParams,
  isSwapTokenLogicSingleHopFields,
} from './types';
import { Currency, CurrencyAmount, Token, TradeType } from '@uniswap/sdk-core';
import { FeeAmount, Pool, Route, SwapQuoter, computePoolAddress, encodeRouteToPath } from '@uniswap/v3-sdk';
import { ISwapRouter } from './contracts/SwapRouter';
import JSBI from 'jsbi';
import { Pool__factory, SwapRouter__factory } from './contracts';
import { UNSUPPORTED_TOKEN_ERROR } from './errors';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { getDeadline, toUniToken } from './utils';

export interface LogicOptions {
  chainId: number;
  provider?: providers.Provider;
  config: Config;
}

export class SwapTokenLogic extends core.Logic {
  public readonly config: Config;

  constructor({ chainId, provider, config }: LogicOptions) {
    super(chainId, provider);
    this.config = config;
  }

  public async quote(params: SwapTokenLogicParams): Promise<SwapTokenLogicFields> {
    if (core.isTokenToTokenExactInParams(params)) {
      const tradeType = core.TradeType.exactIn;
      const { input, tokenOut, slippage } = params;
      const amountSpecified = CurrencyAmount.fromRawAmount(toUniToken(input.token.wrapped), input.amountWei.toString());
      const otherCurrency = toUniToken(tokenOut.wrapped);
      const { route, outputAmount } = await this.getBestTrade(TradeType.EXACT_INPUT, amountSpecified, otherCurrency);
      const output = new common.TokenAmount(tokenOut, outputAmount.toExact());
      if (route.pools.length === 1) {
        return { tradeType, input, output, fee: route.pools[0].fee, slippage };
      } else {
        return { tradeType, input, output, path: encodeRouteToPath(route, false), slippage };
      }
    } else {
      const tradeType = core.TradeType.exactOut;
      const { tokenIn, output, slippage } = params;
      const amountSpecified = CurrencyAmount.fromRawAmount(
        toUniToken(output.token.wrapped),
        output.amountWei.toString()
      );
      const otherCurrency = toUniToken(tokenIn.wrapped);
      const { route, inputAmount } = await this.getBestTrade(TradeType.EXACT_OUTPUT, amountSpecified, otherCurrency);
      const amountIn = common.calcSlippage(inputAmount.quotient.toString(), -(slippage ?? 0));
      const input = new common.TokenAmount(tokenIn, common.toBigUnit(amountIn, tokenIn.decimals));
      if (route.pools.length === 1) {
        return { tradeType, input, output, fee: route.pools[0].fee, slippage };
      } else {
        return { tradeType, input, output, path: encodeRouteToPath(route, true), slippage };
      }
    }
  }

  // https://github.com/Uniswap/v3-sdk/blob/000fccfbbebadabadfa6d689ebc85a50489d25d4/src/swapRouter.ts#L64
  async build(fields: SwapTokenLogicFields, options: SwapTokenLogicOptions) {
    const { tradeType, input, output, balanceBps, slippage } = fields;
    const { account } = options;

    const recipient = await this.calcAgent(account);
    const deadline = getDeadline(this.chainId);
    const amountIn = input.amountWei;
    const amountOut =
      tradeType === core.TradeType.exactIn && slippage
        ? common.calcSlippage(output.amountWei, slippage)
        : output.amountWei;

    const iface = SwapRouter__factory.createInterface();
    let data: string;
    let amountOffset: BigNumberish | undefined;
    if (isSwapTokenLogicSingleHopFields(fields)) {
      const tokenIn = input.token.wrapped.address;
      const tokenOut = output.token.wrapped.address;
      if (tradeType === core.TradeType.exactIn) {
        const params: ISwapRouter.ExactInputSingleParamsStruct = {
          tokenIn,
          tokenOut,
          fee: fields.fee,
          recipient,
          deadline,
          amountIn,
          amountOutMinimum: amountOut,
          sqrtPriceLimitX96: 0,
        };
        data = iface.encodeFunctionData('exactInputSingle', [params]);
        if (balanceBps) amountOffset = common.getParamOffset(5);
      } else {
        const params: ISwapRouter.ExactOutputSingleParamsStruct = {
          tokenIn,
          tokenOut,
          fee: fields.fee,
          recipient,
          deadline,
          amountOut,
          amountInMaximum: amountIn,
          sqrtPriceLimitX96: 0,
        };
        data = iface.encodeFunctionData('exactOutputSingle', [params]);
      }
    } else {
      if (tradeType === core.TradeType.exactIn) {
        const params: ISwapRouter.ExactInputParamsStruct = {
          path: fields.path,
          recipient,
          deadline,
          amountIn,
          amountOutMinimum: amountOut,
        };
        data = iface.encodeFunctionData('exactInput', [params]);
        if (balanceBps) amountOffset = common.getParamOffset(3);
      } else {
        const params: ISwapRouter.ExactOutputParamsStruct = {
          path: fields.path,
          recipient,
          deadline,
          amountOut,
          amountInMaximum: amountIn,
        };
        data = iface.encodeFunctionData('exactOutput', [params]);
      }
    }
    const inputs = [
      core.newLogicInput({
        input: new common.TokenAmount(input.token.wrapped, input.amount),
        balanceBps,
        amountOffset,
      }),
    ];
    const wrapMode = input.token.isNative
      ? core.WrapMode.wrapBefore
      : output.token.isNative
      ? core.WrapMode.unwrapAfter
      : core.WrapMode.none;

    return core.newLogic({ to: this.config.swapRouterAddress, data, inputs, wrapMode });
  }

  // https://github.com/Uniswap/interface/blob/v4.204.5/src/pages/Swap/index.tsx#L203
  // https://github.com/Uniswap/interface/blob/v4.204.5/src/pages/Swap/index.tsx#L343
  // https://github.com/Uniswap/interface/blob/v4.204.5/src/hooks/useSwapCallback.tsx#L14
  // https://github.com/Uniswap/interface/blob/v4.204.5/src/state/swap/hooks.tsx#L116
  // https://github.com/Uniswap/interface/blob/v4.204.5/src/hooks/useBestTrade.ts#L21
  // https://github.com/Uniswap/interface/blob/v4.204.5/src/hooks/useBestTrade.ts#L61
  // https://github.com/Uniswap/interface/blob/v4.204.5/src/hooks/useClientSideV3Trade.ts#L31
  // https://github.com/Uniswap/interface/blob/v4.204.5/src/state/routing/types.ts#L71
  public async getBestTrade(tradeType: TradeType, amountSpecified: CurrencyAmount<Currency>, otherCurrency: Currency) {
    const [currencyIn, currencyOut] =
      tradeType === TradeType.EXACT_INPUT
        ? [amountSpecified.currency, otherCurrency]
        : [otherCurrency, amountSpecified.currency];
    const routes = await this.getAllRoutes(currencyIn, currencyOut);
    if (routes.length === 0) throw UNSUPPORTED_TOKEN_ERROR;

    const results = await Promise.all<common.Multicall3.ResultStructOutput>(
      routes.map((route) =>
        this.multicall3.callStatic
          .tryAggregate(false, [
            {
              target: this.config.quoter.address,
              callData: SwapQuoter.quoteCallParameters(route, amountSpecified, tradeType, {
                useQuoterV2: this.config.quoter.isV2,
              }).calldata,
            },
          ])
          .then((returnData) => returnData[0])
      )
    );

    const { route, inputAmount, outputAmount } = results.reduce(
      (
        currentBest: {
          route: Route<Currency, Currency> | null;
          inputAmount: CurrencyAmount<Currency> | null;
          outputAmount: CurrencyAmount<Currency> | null;
        },
        [success, returnData],
        i
      ) => {
        if (!success || returnData === '0x') return currentBest;

        const route = routes[i];

        let amount: string;
        if (this.config.quoter.isV2) {
          let types: string[];
          if (route.pools.length === 1) {
            types = ['uint256', 'uint160', 'uint32', 'uint256'];
          } else {
            types = ['uint256', 'uint160[]', 'uint32[]', 'uint256'];
          }
          const decoded = utils.defaultAbiCoder.decode(types, returnData);
          amount = decoded[0].toString();
        } else {
          amount = returnData;
        }

        // overwrite the current best if it's not defined or if this route is better
        if (tradeType === TradeType.EXACT_INPUT) {
          const amountOut = CurrencyAmount.fromRawAmount(currencyOut, amount);
          if (
            currentBest.outputAmount === null ||
            JSBI.lessThan(currentBest.outputAmount!.quotient, amountOut.quotient)
          ) {
            return { route, inputAmount: amountSpecified, outputAmount: amountOut };
          }
        } else {
          const amountIn = CurrencyAmount.fromRawAmount(currencyIn, amount);
          if (
            currentBest.inputAmount === null ||
            JSBI.greaterThan(currentBest.inputAmount.quotient, amountIn.quotient)
          ) {
            return { route, inputAmount: amountIn, outputAmount: amountSpecified };
          }
        }

        return currentBest;
      },
      { route: null, inputAmount: null, outputAmount: null }
    );
    if (!route || !inputAmount || !outputAmount) throw UNSUPPORTED_TOKEN_ERROR;

    return { route, inputAmount, outputAmount };
  }

  // https://github.com/Uniswap/interface/blob/v4.204.5/src/hooks/useAllV3Routes.ts#L62
  public async getAllRoutes(currencyIn: Currency, currencyOut: Currency) {
    const pools = await this.getPools(currencyIn, currencyOut);
    const routes = this.computeAllRoutes(currencyIn, currencyOut, pools, [], [], currencyIn, 2);

    return routes;
  }

  // https://github.com/Uniswap/interface/blob/v4.204.5/src/hooks/useV3SwapPools.ts#L15
  // https://github.com/Uniswap/interface/blob/v4.204.5/src/hooks/usePools.ts#L86
  public async getPools(currencyIn: Currency, currencyOut: Currency) {
    const allCurrencyCombinationsWithAllFees = this.getAllCurrencyCombinationsWithAllFees(currencyIn, currencyOut);
    const poolTokens: [Token, Token, FeeAmount][] = allCurrencyCombinationsWithAllFees.map(([tokenA, tokenB, fee]) =>
      tokenA.sortsBefore(tokenB) ? [tokenA, tokenB, fee] : [tokenB, tokenA, fee]
    );

    const iface = Pool__factory.createInterface();
    const callDataSlot0 = iface.encodeFunctionData('slot0');
    const callDataLiquidity = iface.encodeFunctionData('liquidity');

    const callsSlot0: common.Multicall3.CallStruct[] = [];
    const callsLiquidity: common.Multicall3.CallStruct[] = [];
    for (const [tokenA, tokenB, fee] of poolTokens) {
      const poolAddress = computePoolAddress({ factoryAddress: this.config.factoryAddress, tokenA, tokenB, fee });
      callsSlot0.push({ target: poolAddress, callData: callDataSlot0 });
      callsLiquidity.push({ target: poolAddress, callData: callDataLiquidity });
    }

    const [resultsSlot0, resultsLiquidity] = await Promise.all([
      this.multicall3.callStatic.tryAggregate(false, callsSlot0),
      this.multicall3.callStatic.tryAggregate(false, callsLiquidity),
    ]);

    const pools = poolTokens.reduce((accumulator, [tokenA, tokenB, fee], i) => {
      const resultSlot0 = resultsSlot0[i];
      const resultLiquidity = resultsLiquidity[i];
      if (
        resultSlot0.success &&
        resultSlot0.returnData !== '0x' &&
        resultLiquidity.success &&
        resultLiquidity.returnData !== '0x'
      ) {
        const slot0 = iface.decodeFunctionResult('slot0', resultSlot0.returnData);
        if (slot0.sqrtPriceX96 && !slot0.sqrtPriceX96.isZero()) {
          const [liquidity] = iface.decodeFunctionResult('liquidity', resultLiquidity.returnData);
          accumulator.push(new Pool(tokenA, tokenB, fee, slot0.sqrtPriceX96, liquidity, slot0.tick));
        }
      }

      return accumulator;
    }, [] as Pool[]);

    return pools;
  }

  // https://github.com/Uniswap/interface/blob/v4.204.5/src/hooks/useAllCurrencyCombinations.ts#L6
  public getAllCurrencyCombinations(currencyA: Currency, currencyB: Currency) {
    const [tokenA, tokenB] = [currencyA.wrapped, currencyB.wrapped];

    const common = this.config.bases;
    const additionalA = tokenA ? this.config.additionalBases?.[tokenA.address] ?? [] : [];
    const additionalB = tokenB ? this.config.additionalBases?.[tokenB.address] ?? [] : [];
    const bases = [...common, ...additionalA, ...additionalB];
    const basePairs = bases
      .flatMap((base): [Token, Token][] => bases.map((otherBase) => [base, otherBase]))
      .filter(([t0, t1]) => !t0.equals(t1));

    const allCurrencyCombinations = [
      // the direct pair
      [tokenA, tokenB] as [Token, Token],
      // token A against all bases
      ...bases.map((base): [Token, Token] => [tokenA, base]),
      // token B against all bases
      ...bases.map((base): [Token, Token] => [tokenB, base]),
      // each base against all bases
      ...basePairs,
    ]
      .filter(([t0, t1]) => !t0.equals(t1))
      // filter out duplicate pairs
      .filter(([t0, t1], i, otherPairs) => {
        // find the first index in the array at which there are the same 2 tokens as the current
        const firstIndexInOtherPairs = otherPairs.findIndex(([t0Other, t1Other]) => {
          return (t0.equals(t0Other) && t1.equals(t1Other)) || (t0.equals(t1Other) && t1.equals(t0Other));
        });
        // only accept the first occurrence of the same 2 tokens
        return firstIndexInOtherPairs === i;
      }) // optionally filter out some pairs for tokens with custom bases defined
      .filter(([tokenA, tokenB]) => {
        const customBasesA = this.config.customBases?.[tokenA.address];
        const customBasesB = this.config.customBases?.[tokenB.address];
        if (!customBasesA && !customBasesB) return true;
        if (customBasesA && !customBasesA.find((base) => tokenB.equals(base))) return false;
        if (customBasesB && !customBasesB.find((base) => tokenA.equals(base))) return false;

        return true;
      });

    return allCurrencyCombinations;
  }

  // https://github.com/Uniswap/interface/blob/v4.204.5/src/hooks/useV3SwapPools.ts#L26
  public getAllCurrencyCombinationsWithAllFees(currencyIn: Currency, currencyOut: Currency) {
    const allCurrencyCombinations = this.getAllCurrencyCombinations(currencyIn, currencyOut);
    const allCurrencyCombinationsWithAllFees = allCurrencyCombinations.reduce<[Token, Token, FeeAmount][]>(
      (list, [tokenA, tokenB]) => {
        for (const feeAmount of this.config.feeAmounts) {
          list.push([tokenA, tokenB, feeAmount]);
        }
        return list;
      },
      []
    );

    return allCurrencyCombinationsWithAllFees;
  }

  // https://github.com/Uniswap/interface/blob/v4.204.5/src/hooks/useAllV3Routes.ts#L13
  public poolEquals(poolA: Pool, poolB: Pool) {
    return (
      poolA === poolB ||
      (poolA.token0.equals(poolB.token0) && poolA.token1.equals(poolB.token1) && poolA.fee === poolB.fee)
    );
  }

  // https://github.com/Uniswap/interface/blob/v4.204.5/src/hooks/useAllV3Routes.ts#L20
  public computeAllRoutes(
    currencyIn: Currency,
    currencyOut: Currency,
    pools: Pool[],
    currentPath: Pool[] = [],
    allPaths: Route<Currency, Currency>[] = [],
    startCurrencyIn: Currency = currencyIn,
    maxHops = 2
  ) {
    const tokenIn = currencyIn.wrapped;
    const tokenOut = currencyOut.wrapped;
    for (const pool of pools) {
      if (!pool.involvesToken(tokenIn) || currentPath.find((pathPool) => this.poolEquals(pool, pathPool))) continue;

      const outputToken = pool.token0.equals(tokenIn) ? pool.token1 : pool.token0;
      if (outputToken.equals(tokenOut)) {
        allPaths.push(new Route([...currentPath, pool], startCurrencyIn, currencyOut));
      } else if (maxHops > 1) {
        this.computeAllRoutes(
          outputToken,
          currencyOut,
          pools,
          [...currentPath, pool],
          allPaths,
          startCurrencyIn,
          maxHops - 1
        );
      }
    }

    return allPaths;
  }
}

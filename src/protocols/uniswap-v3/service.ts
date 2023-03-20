import { Currency, CurrencyAmount, Token, TradeType } from '@uniswap/sdk-core';
import { FACTORY_ADDRESS, FeeAmount, Pool, Route, SwapQuoter, computePoolAddress } from '@uniswap/v3-sdk';
import JSBI from 'jsbi';
import { QUOTER_ADDRESS } from './constants';
import { UniswapV3Pool__factory } from './contracts';
import * as common from '@composable-router/common';
import { computeAllRoutes, getAllCurrencyCombinationsWithAllFees } from './utils';
import invariant from 'tiny-invariant';

export class Service extends common.Web3Toolkit {
  // https://github.com/Uniswap/interface/blob/v4.204.5/src/pages/Swap/index.tsx#L203
  // https://github.com/Uniswap/interface/blob/v4.204.5/src/pages/Swap/index.tsx#L343
  // https://github.com/Uniswap/interface/blob/v4.204.5/src/hooks/useSwapCallback.tsx#L14
  // https://github.com/Uniswap/interface/blob/v4.204.5/src/state/swap/hooks.tsx#L116
  // https://github.com/Uniswap/interface/blob/v4.204.5/src/hooks/useBestTrade.ts#L21
  // https://github.com/Uniswap/interface/blob/v4.204.5/src/hooks/useBestTrade.ts#L61
  // https://github.com/Uniswap/interface/blob/v4.204.5/src/hooks/useClientSideV3Trade.ts#L31
  // https://github.com/Uniswap/interface/blob/v4.204.5/src/state/routing/types.ts#L71
  async getBestTrade(tradeType: TradeType, amountSpecified: CurrencyAmount<Currency>, otherCurrency: Currency) {
    const [currencyIn, currencyOut] =
      tradeType === TradeType.EXACT_INPUT
        ? [amountSpecified.currency, otherCurrency]
        : [otherCurrency, amountSpecified.currency];

    const routes = await this.getAllRoutes(currencyIn, currencyOut);
    invariant(routes.length > 0, 'invalid swap');

    const calls: common.Multicall2.CallStruct[] = routes.map((route) => ({
      target: QUOTER_ADDRESS,
      callData: SwapQuoter.quoteCallParameters(route, amountSpecified, tradeType).calldata,
    }));
    const results = await this.multicall2.callStatic.tryAggregate(false, calls);

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
        if (!success) return currentBest;

        // overwrite the current best if it's not defined or if this route is better
        if (tradeType === TradeType.EXACT_INPUT) {
          const amountOut = CurrencyAmount.fromRawAmount(currencyOut, returnData);
          if (
            currentBest.outputAmount === null ||
            JSBI.lessThan(currentBest.outputAmount.quotient, amountOut.quotient)
          ) {
            return { route: routes[i], inputAmount: amountSpecified, outputAmount: amountOut };
          }
        } else {
          const amountIn = CurrencyAmount.fromRawAmount(currencyIn, returnData);
          if (
            currentBest.inputAmount === null ||
            JSBI.greaterThan(currentBest.inputAmount.quotient, amountIn.quotient)
          ) {
            return { route: routes[i], inputAmount: amountIn, outputAmount: amountSpecified };
          }
        }

        return currentBest;
      },
      { route: null, inputAmount: null, outputAmount: null }
    );
    if (!route || !inputAmount || !outputAmount) throw new Error('no route found');

    return { route, inputAmount, outputAmount };
  }

  // https://github.com/Uniswap/interface/blob/v4.204.5/src/hooks/useAllV3Routes.ts#L62
  private async getAllRoutes(currencyIn: Currency, currencyOut: Currency) {
    const pools = await this.getPools(currencyIn, currencyOut);
    const routes = computeAllRoutes(currencyIn, currencyOut, pools, this.chainId, [], [], currencyIn, 2);

    return routes;
  }

  // https://github.com/Uniswap/interface/blob/v4.204.5/src/hooks/useV3SwapPools.ts#L15
  // https://github.com/Uniswap/interface/blob/v4.204.5/src/hooks/usePools.ts#L86
  private async getPools(currencyIn: Currency, currencyOut: Currency) {
    const allCurrencyCombinationsWithAllFees = getAllCurrencyCombinationsWithAllFees(
      this.chainId,
      currencyIn,
      currencyOut
    );
    const poolTokens: [Token, Token, FeeAmount][] = allCurrencyCombinationsWithAllFees.map(([tokenA, tokenB, fee]) =>
      tokenA.sortsBefore(tokenB) ? [tokenA, tokenB, fee] : [tokenB, tokenA, fee]
    );
    const poolAddresses = poolTokens.map(([tokenA, tokenB, fee]) =>
      computePoolAddress({ factoryAddress: FACTORY_ADDRESS, tokenA, tokenB, fee })
    );

    const iface = UniswapV3Pool__factory.createInterface();

    const callDataSlot0 = iface.encodeFunctionData('slot0');
    const callsSlot0: common.Multicall2.CallStruct[] = poolAddresses.map((address) => ({
      target: address,
      callData: callDataSlot0,
    }));
    const resultsSlot0 = await this.multicall2.callStatic.tryAggregate(false, callsSlot0);

    const callDataLiquidity = iface.encodeFunctionData('liquidity');
    const callsLiquidity: common.Multicall2.CallStruct[] = poolAddresses.map((address) => ({
      target: address,
      callData: callDataLiquidity,
    }));
    const resultsLiquidity = await this.multicall2.callStatic.tryAggregate(false, callsLiquidity);

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
}

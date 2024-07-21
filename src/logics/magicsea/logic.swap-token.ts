import { BigNumber, constants, ethers } from 'ethers';
import { BigintIsh, JSBI, Pair, Percent, Token, TokenAmount, Trade } from '@uniswap/sdk';
import { MagicSeaFactory__factory, MagicSeaPair__factory, MagicSeaRouter__factory } from './contracts';
import { axios } from 'src/utils';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { getBaseTokens, getContractAddress, getTokenListUrls, supportedChainIds } from './configs';
import { toCurrency, toCurrencyAmount, toToken, toUniToken } from './utils';

export type SwapTokenLogicTokenList = common.Token[];

export type SwapTokenLogicParams = core.TokenToTokenParams<{ slippage?: number }>;

export type SwapTokenLogicFields = core.TokenToTokenFields<{ path: string[]; slippage?: number }>;

export type SwapTokenLogicOptions = Pick<core.GlobalOptions, 'account'>;

export class SwapTokenLogic
  extends core.Logic
  implements core.LogicTokenListInterface, core.LogicOracleInterface, core.LogicBuilderInterface
{
  static id = 'swap-token';
  static protocolId = 'magicsea';
  static readonly supportedChainIds = supportedChainIds;

  async getTokenList() {
    const tokenListUrls = getTokenListUrls(this.chainId);
    const tokenList: SwapTokenLogicTokenList = [this.nativeToken];
    const tmp: Record<string, boolean> = { [this.nativeToken.address]: true };

    await Promise.all(
      tokenListUrls.map(async (tokenListUrl) => {
        try {
          const { data } = await axios.get<{
            tokens: {
              name: string;
              symbol: string;
              decimals: number;
              logoURI: string;
              address: string;
              chainId: number;
            }[];
          }>(tokenListUrl);
          for (const { name, symbol, decimals, logoURI, address, chainId } of data.tokens) {
            const lowerCaseAddress = address.toLowerCase();

            if (
              tmp[lowerCaseAddress] ||
              chainId !== this.chainId ||
              !name ||
              !symbol ||
              !decimals ||
              !ethers.utils.isAddress(address)
            ) {
              continue;
            }
            tokenList.push(new common.Token(chainId, address, decimals, symbol, name, logoURI));
            tmp[lowerCaseAddress] = true;
          }
        } catch {}
      })
    );

    return tokenList;
  }

  async quote(params: SwapTokenLogicParams) {
    const maxHops = 3;
    const maxNumResults = 3;

    let path: string[] = [];
    let priceImpact = '0';

    if (core.isTokenToTokenExactInParams(params)) {
      const tradeType = core.TradeType.exactIn;
      const { input, slippage } = params;

      const tokenIn = input.token.wrapped;
      const tokenOut = params.tokenOut.wrapped;

      const pairs = await this.getAllCommonPairs(toUniToken(tokenIn), toUniToken(tokenOut));
      const trade = Trade.bestTradeExactIn(
        pairs,
        toCurrencyAmount(tokenIn, input.amountWei.toString()),
        toCurrency(tokenOut),
        {
          maxHops,
          maxNumResults,
        }
      )[0];

      let amountOut = '0';
      if (trade) {
        amountOut = trade.outputAmount.toFixed();
        path = trade.route.path.map((token) => token.address);
        priceImpact = trade.priceImpact.toFixed();
      }
      const output = new common.TokenAmount(params.tokenOut).set(amountOut);

      return {
        tradeType,
        input,
        output,
        path,
        priceImpact,
        slippage,
      };
    } else {
      const tradeType = core.TradeType.exactOut;
      const { output, slippage } = params;

      const tokenIn = params.tokenIn.wrapped;
      const tokenOut = output.token.wrapped;

      const pairs = await this.getAllCommonPairs(toUniToken(tokenIn), toUniToken(tokenOut));
      const trade = Trade.bestTradeExactOut(
        pairs,
        toCurrency(tokenIn),
        toCurrencyAmount(tokenOut, output.amountWei.toString()),
        {
          maxHops,
          maxNumResults,
        }
      )[0];

      let amountIn = '0';
      if (trade) {
        amountIn = slippage
          ? trade.maximumAmountIn(new Percent(JSBI.BigInt(slippage), JSBI.BigInt(10000))).toFixed()
          : trade.inputAmount.toFixed();

        path = trade.route.path.map((token) => token.address);
        priceImpact = trade.priceImpact.toFixed();
      }
      const input = new common.TokenAmount(params.tokenIn).set(amountIn);

      return {
        tradeType,
        input,
        output,
        path,
        priceImpact,
        slippage,
      };
    }
  }

  async build(fields: SwapTokenLogicFields, options: SwapTokenLogicOptions) {
    const { tradeType, input, output, path, slippage, balanceBps } = fields;
    const { account } = options;

    const receiver = await this.calcAgent(account);
    const deadline = BigNumber.from(Math.floor(Date.now() / 1000)).add(1800); // 30m

    let data, inputs;
    if (tradeType === core.TradeType.exactIn) {
      const amountIn = input.amountWei;
      const amountOutMin = slippage ? common.calcSlippage(output.amountWei, slippage) : output.amountWei;
      data = MagicSeaRouter__factory.createInterface().encodeFunctionData('swapExactTokensForTokens', [
        amountIn,
        amountOutMin,
        path,
        receiver,
        deadline,
      ]);

      const amountOffset = balanceBps ? common.getParamOffset(0) : undefined;
      inputs = [
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

      return core.newLogic({ to: getContractAddress(this.chainId, 'Router'), data, inputs, wrapMode });
    } else {
      const amountInMax = input.amountWei;
      const amountOut = output.amountWei;
      data = MagicSeaRouter__factory.createInterface().encodeFunctionData('swapTokensForExactTokens', [
        amountOut,
        amountInMax,
        path,
        receiver,
        deadline,
      ]);

      inputs = [
        core.newLogicInput({
          input: new common.TokenAmount(input.token.wrapped, input.amount),
        }),
      ];

      const wrapMode = input.token.isNative
        ? core.WrapMode.wrapBefore
        : output.token.isNative
        ? core.WrapMode.unwrapAfter
        : core.WrapMode.none;

      return core.newLogic({ to: getContractAddress(this.chainId, 'Router'), data, inputs, wrapMode });
    }
  }

  async getAllCommonPairs(tokenA: Token, tokenB: Token, isAll = true): Promise<Pair[]> {
    const pairTokens = this.generateAllRoutePairs(tokenA, tokenB);
    const pairAddresses = await this.getPairAddresses(pairTokens);
    const addresses = isAll ? pairAddresses : [pairAddresses[0]];

    const callsGetReserves: common.Multicall3.CallStruct[] = [];
    const iface = MagicSeaPair__factory.createInterface();
    for (let i = 0; i < addresses.length; i++) {
      const pairAddress = addresses[i];
      if (pairAddress) {
        const callDataGetReserves = iface.encodeFunctionData('getReserves');
        callsGetReserves.push({ target: pairAddress, callData: callDataGetReserves });
      }
    }

    const [resultsGetReserves] = await Promise.all([this.multicall3.callStatic.tryAggregate(false, callsGetReserves)]);

    let j = 0;
    const results: [BigintIsh, BigintIsh][] = [];
    for (let i = 0; i < addresses.length; i++) {
      const pairAddress = addresses[i];
      if (!pairAddress) {
        results.push(['0', '0']);
      } else {
        const resultGetReserves = resultsGetReserves[j];
        if (resultGetReserves.success && resultGetReserves.returnData !== '0x') {
          const [reserve0, reserve1] = iface.decodeFunctionResult('getReserves', resultGetReserves.returnData);
          results.push([reserve0.toString(), reserve1.toString()]);
        } else {
          results.push(['0', '0']);
        }
        j++;
      }
    }

    const pairs = results.reduce((accumulator, result, i) => {
      if (result) {
        const tokenA = pairTokens[i][0];
        const tokenB = pairTokens[i][1];

        const [reserve0, reserve1] = result;
        const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA];

        const pair = new Pair(
          new TokenAmount(token0, reserve0.toString()),
          new TokenAmount(token1, reserve1.toString())
        );

        accumulator.push(pair);
      }

      return accumulator;
    }, [] as Pair[]);

    return pairs;
  }

  generateAllRoutePairs(tokenA?: Token, tokenB?: Token): [Token, Token][] {
    const allBases = getBaseTokens(this.chainId).map((baseToken) => toUniToken(baseToken));

    const basePairs: [Token, Token][] = [];
    for (let i = 0; i < allBases.length; i++) {
      for (let j = i + 1; j < allBases.length; j++) {
        basePairs.push([allBases[i], allBases[j]]);
      }
    }

    return [
      // the direct pair
      [tokenA, tokenB],
      // token A against all bases
      ...allBases.map((base): [Token | undefined, Token] => [tokenA, base]),
      // token B against all bases
      ...allBases.map((base): [Token | undefined, Token] => [tokenB, base]),
      // each base against all bases
      ...basePairs,
    ]
      .filter((tokens): tokens is [Token, Token] => Boolean(tokens[0] && tokens[1]))
      .filter(([t0, t1]) => t0.address !== t1.address);
  }

  async getPairAddresses(pairTokens: Token[][]): Promise<Array<string | undefined>> {
    const pairAddresses = [];
    const multicallRecords = [];
    const callsGetPair: common.Multicall3.CallStruct[] = [];
    const iface = MagicSeaFactory__factory.createInterface();

    // compose multi-calls
    for (let i = 0; i < pairTokens.length; i++) {
      const tokenA = pairTokens[i][0];
      const tokenB = pairTokens[i][1];

      if (tokenA && tokenB && !tokenA.equals(tokenB)) {
        const tokenIn = toToken(tokenA);
        const tokenOut = toToken(tokenB);
        const [token0, token1] = tokenIn.sortsBefore(tokenOut) ? [tokenIn, tokenOut] : [tokenOut, tokenIn];

        const callDataGetPair = iface.encodeFunctionData('getPair', [token0.address, token1.address]);
        const factorAddress = getContractAddress(this.chainId, 'Factory');
        callsGetPair.push({ target: factorAddress, callData: callDataGetPair });
        multicallRecords.push(true);
      } else {
        multicallRecords.push(false);
      }
    }

    const [resultsGetPair] = await Promise.all([this.multicall3.callStatic.tryAggregate(false, callsGetPair)]);

    // decode multicall results
    let j = 0;
    for (let i = 0; i < multicallRecords.length; i++) {
      if (multicallRecords[i]) {
        const resultGetPair = resultsGetPair[j];
        if (resultGetPair.success && resultGetPair.returnData !== '0x') {
          const [pairAddress] = iface.decodeFunctionResult('getPair', resultGetPair.returnData);
          if (pairAddress === constants.AddressZero) pairAddresses.push(undefined);
          else {
            pairAddresses.push(pairAddress);
          }
        } else {
          pairAddresses.push(undefined);
        }
        j++;
      } else {
        pairAddresses.push(undefined);
      }
    }
    return pairAddresses;
  }
}

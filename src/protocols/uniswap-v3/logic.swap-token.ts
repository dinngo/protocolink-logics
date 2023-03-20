import { CurrencyAmount, Token, TradeType } from '@uniswap/sdk-core';
import { ISwapRouter } from './contracts/SwapRouter';
import { SWAP_ROUTER_ADDRESS } from './constants';
import { Service } from './service';
import { SetOptional } from 'type-fest';
import { SwapRouter__factory } from './contracts';
import { TokenList } from '@uniswap/token-lists';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import * as common from '@composable-router/common';
import { constants } from 'ethers';
import * as core from '@composable-router/core';
import { encodeRouteToPath } from '@uniswap/v3-sdk';
import { getDeadline } from './utils';

axiosRetry(axios, { retries: 5, retryDelay: axiosRetry.exponentialDelay });

export type SwapTokenLogicSingleHopQuotation = { amount: string; fee: number };

export type SwapTokenLogicMultiHopQuotation = { amount: string; path: string };

export type SwapTokenLogicQuotation = SwapTokenLogicSingleHopQuotation | SwapTokenLogicMultiHopQuotation;

export function isSwapTokenLogicSingleHopQuotation(v: any): v is SwapTokenLogicSingleHopQuotation {
  return !!v.fee;
}

export type SwapTokenLogicParams = core.TokenToTokenParams;

export type SwapTokenLogicSingleHopFields = core.TokenToTokenFields<{ fee: number }>;

export type SwapTokenLogicMultiHopFields = core.TokenToTokenFields<{ path: string }>;

export type SwapTokenLogicFields = SwapTokenLogicSingleHopFields | SwapTokenLogicMultiHopFields;

export type SwapTokenLogicOptions = SetOptional<Pick<core.GlobalOptions, 'account' | 'slippage'>, 'slippage'>;

export function isSwapTokenLogicSingleHopFields(v: any): v is SwapTokenLogicSingleHopFields {
  return !!v.fee;
}

@core.LogicDefinitionDecorator()
export class SwapTokenLogic extends core.Logic implements core.LogicTokenListInterface, core.LogicOracleInterface {
  static readonly supportedChainIds = [
    common.ChainId.mainnet,
    common.ChainId.polygon,
    common.ChainId.arbitrum,
    common.ChainId.optimism,
  ];

  async getTokenList() {
    const { data } = await axios.get<TokenList>('https://gateway.ipfs.io/ipns/tokens.uniswap.org');

    const tmp: Record<string, boolean> = { [this.nativeToken.address]: true };
    const tokenList: common.TokenTypes[] = [this.nativeToken];
    for (const token of data.tokens) {
      if (tmp[token.address] || token.chainId !== this.chainId) continue;
      tokenList.push({
        chainId: token.chainId,
        address: token.address,
        decimals: token.decimals,
        symbol: token.symbol,
        name: token.name,
      });
      tmp[token.address] = true;
    }

    return tokenList;
  }

  async getExactInBestTrade(input: common.TokenAmount, tokenOut: common.Token) {
    // should convert to wrapped native token first
    const wrappedTokenIn = input.token.wrapped;
    const wrappedTokenOut = tokenOut.wrapped;

    const tradeType = TradeType.EXACT_INPUT;
    const amountSpecified = CurrencyAmount.fromRawAmount(
      new Token(wrappedTokenIn.chainId, wrappedTokenIn.address, wrappedTokenIn.decimals),
      input.amountWei.toString()
    );
    const otherCurrency = new Token(wrappedTokenOut.chainId, wrappedTokenOut.address, wrappedTokenOut.decimals);
    const service = new Service(this.chainId, this.provider);
    const bestTrade = await service.getBestTrade(tradeType, amountSpecified, otherCurrency);

    return bestTrade;
  }

  async getExactOutBestTrade(tokenIn: common.Token, output: common.TokenAmount) {
    // should convert to wrapped native token first
    const wrappedTokenIn = tokenIn.wrapped;
    const wrappedTokenOut = output.token.wrapped;

    const tradeType = TradeType.EXACT_OUTPUT;
    const amountSpecified = CurrencyAmount.fromRawAmount(
      new Token(wrappedTokenOut.chainId, wrappedTokenOut.address, wrappedTokenOut.decimals),
      output.amountWei.toString()
    );
    const otherCurrency = new Token(wrappedTokenIn.chainId, wrappedTokenIn.address, wrappedTokenIn.decimals);
    const service = new Service(this.chainId, this.provider);
    const bestTrade = await service.getBestTrade(tradeType, amountSpecified, otherCurrency);

    return bestTrade;
  }

  async quote(params: SwapTokenLogicParams) {
    let quotation: SwapTokenLogicQuotation;
    if (core.isTokenToTokenExactInParams(params)) {
      const { input, tokenOut } = params;
      const { route, outputAmount } = await this.getExactInBestTrade(input, tokenOut);
      const amount = outputAmount.toExact();
      if (route.pools.length === 1) {
        quotation = { amount, fee: route.pools[0].fee };
      } else {
        quotation = { amount, path: encodeRouteToPath(route, false) };
      }
    } else {
      const { tokenIn, output } = params;
      const { route, inputAmount } = await this.getExactOutBestTrade(tokenIn, output);
      const amountIn = common.calcSlippage(inputAmount.quotient.toString(), -100); // 1% slippage
      const amount = common.toBigUnit(amountIn, tokenIn.decimals);
      if (route.pools.length === 1) {
        quotation = { amount, fee: route.pools[0].fee };
      } else {
        quotation = { amount, path: encodeRouteToPath(route, true) };
      }
    }

    return quotation;
  }

  // https://github.com/Uniswap/v3-sdk/blob/000fccfbbebadabadfa6d689ebc85a50489d25d4/src/swapRouter.ts#L64
  async getLogic(fields: SwapTokenLogicFields, options: SwapTokenLogicOptions) {
    const { tradeType, input, output } = fields;
    const { account, slippage = 100 } = options;

    const recipient = core.calcAccountAgent(this.chainId, account);
    const deadline = getDeadline(this.chainId);
    const amountIn = input.amountWei;
    const amountOut =
      tradeType === core.TradeType.exactIn ? common.calcSlippage(output.amountWei, slippage) : output.amountWei;
    const routerMustCustody = output.token.isNative;

    const iface = SwapRouter__factory.createInterface();
    const datas: string[] = [];
    if (isSwapTokenLogicSingleHopFields(fields)) {
      const tokenIn = input.token.wrapped.address;
      const tokenOut = output.token.wrapped.address;
      if (tradeType === core.TradeType.exactIn) {
        const params: ISwapRouter.ExactInputSingleParamsStruct = {
          tokenIn,
          tokenOut,
          fee: fields.fee,
          recipient: routerMustCustody ? constants.AddressZero : recipient,
          deadline,
          amountIn,
          amountOutMinimum: amountOut,
          sqrtPriceLimitX96: 0,
        };
        datas.push(iface.encodeFunctionData('exactInputSingle', [params]));
      } else {
        const params: ISwapRouter.ExactOutputSingleParamsStruct = {
          tokenIn,
          tokenOut,
          fee: fields.fee,
          recipient: routerMustCustody ? constants.AddressZero : recipient,
          deadline,
          amountOut: output.amountWei,
          amountInMaximum: amountIn,
          sqrtPriceLimitX96: 0,
        };
        datas.push(iface.encodeFunctionData('exactOutputSingle', [params]));
      }
    } else {
      if (tradeType === core.TradeType.exactIn) {
        const params: ISwapRouter.ExactInputParamsStruct = {
          path: fields.path,
          recipient: routerMustCustody ? constants.AddressZero : recipient,
          deadline,
          amountIn,
          amountOutMinimum: amountOut,
        };
        datas.push(iface.encodeFunctionData('exactInput', [params]));
      } else {
        const params: ISwapRouter.ExactOutputParamsStruct = {
          path: fields.path,
          recipient: routerMustCustody ? constants.AddressZero : recipient,
          deadline,
          amountOut,
          amountInMaximum: amountIn,
        };
        datas.push(iface.encodeFunctionData('exactOutput', [params]));
      }
    }
    if (routerMustCustody) {
      datas.push(iface.encodeFunctionData('unwrapWETH9', [amountOut, recipient]));
    }
    if (input.token.isNative && tradeType === core.TradeType.exactOut) {
      datas.push(iface.encodeFunctionData('refundETH'));
    }

    const to = SWAP_ROUTER_ADDRESS;
    const data = datas.length === 1 ? datas[0] : iface.encodeFunctionData('multicall', [datas]);
    const inputs = [core.newLogicInput({ input })];

    return core.newLogic({ to, data, inputs });
  }
}

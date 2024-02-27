import { BuildTxBody, OptimalRate, PriceQueryParams, TransactionParams } from './types';
import { SwapSide } from './constants';
import { TokenList } from '@uniswap/token-lists';
import { axios } from 'src/utils';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { getTokenListUrls, getTokenTransferProxyAddress, supportedChainIds } from './configs';
import invariant from 'tiny-invariant';

export type SwapTokenLogicTokenList = common.Token[];

export type SwapTokenLogicParams = core.TokenToTokenParams<{ slippage?: number; excludeDEXS?: string[] }>;

export type SwapTokenLogicFields = core.TokenToTokenExactInFields<
  Pick<BuildTxBody, 'partner' | 'partnerAddress'> & { slippage?: number; excludeDEXS?: string[] }
>;

export type SwapTokenLogicOptions = Pick<core.GlobalOptions, 'account'>;

export class SwapTokenLogic
  extends core.Logic
  implements core.LogicTokenListInterface, core.LogicOracleInterface, core.LogicBuilderInterface
{
  static id = 'swap-token';
  static protocolId = 'paraswap-v5';
  static readonly supportedChainIds = supportedChainIds;
  static readonly apiUrl = 'https://apiv5.paraswap.io';

  async getTokenList() {
    const tokenListUrls = getTokenListUrls(this.chainId);
    const tokenLists: TokenList[] = [];
    await Promise.all(
      tokenListUrls.map(async (tokenListUrl) => {
        try {
          const { data } = await axios.get<TokenList>(tokenListUrl);
          tokenLists.push(data);
        } catch {}
      })
    );

    const tmp: Record<string, boolean> = { [this.nativeToken.address]: true };
    const tokenList: SwapTokenLogicTokenList = [this.nativeToken];
    for (const { tokens } of tokenLists) {
      for (const { chainId, address, decimals, symbol, name } of tokens) {
        if (tmp[address] || chainId !== this.chainId || !name || !symbol || !decimals) continue;
        tokenList.push(new common.Token(chainId, address, decimals, symbol, name));
        tmp[address] = true;
      }
    }

    return tokenList;
  }

  // If you wish to exclude quotes from specific DEXs, you can include the corresponding DEX Names
  // in the 'excludeDEXS' parameter. You can retrieve DEX Names from the following API:
  // https://api.paraswap.io/adapters/list?network={chainId}&namesOnly=true
  async quote(params: SwapTokenLogicParams) {
    try {
      const { excludeDEXS } = params;

      let input: common.TokenAmount;
      let output: common.TokenAmount;
      if (core.isTokenToTokenExactInParams(params)) {
        let tokenOut: common.Token;
        ({ input, tokenOut } = params);

        const queryParams: PriceQueryParams = {
          srcToken: input.token.elasticAddress,
          srcDecimals: input.token.decimals.toString(),
          amount: input.amountWei.toString(),
          destToken: tokenOut.elasticAddress,
          destDecimals: tokenOut.decimals.toString(),
          side: SwapSide.SELL,
          network: this.chainId.toString(),
        };

        const searchString = new URLSearchParams(queryParams);
        const pricesURL = `${SwapTokenLogic.apiUrl}/prices?${searchString}&excludeDEXS=${excludeDEXS}`;
        const {
          data: { priceRoute },
        } = await axios.get<{ priceRoute: OptimalRate }>(pricesURL);

        output = new common.TokenAmount(tokenOut).setWei(priceRoute.destAmount);
      } else {
        let tokenIn: common.Token;
        ({ tokenIn, output } = params);

        const queryParams: PriceQueryParams = {
          srcToken: tokenIn.elasticAddress,
          srcDecimals: tokenIn.decimals.toString(),
          amount: output.amountWei.toString(),
          destToken: output.token.elasticAddress,
          destDecimals: output.token.decimals.toString(),
          side: SwapSide.BUY,
          network: this.chainId.toString(),
        };

        const searchString = new URLSearchParams(queryParams);
        const pricesURL = `${SwapTokenLogic.apiUrl}/prices?${searchString}&excludeDEXS=${excludeDEXS}`;
        const {
          data: { priceRoute },
        } = await axios.get<{ priceRoute: OptimalRate }>(pricesURL);

        input = new common.TokenAmount(tokenIn).setWei(priceRoute.srcAmount);
      }

      return { input, output, slippage: params.slippage, excludeDEXS };
    } catch {
      invariant(false, 'no route found or price impact too high');
    }
  }

  async build(fields: SwapTokenLogicFields, options: SwapTokenLogicOptions) {
    const txURL = `${SwapTokenLogic.apiUrl}/transactions/${this.chainId}?ignoreChecks=true&ignoreGasEstimate=true`;
    const { input, output, partner, partnerAddress, slippage, excludeDEXS } = fields;
    const { account } = options;

    const queryParams: PriceQueryParams = {
      srcToken: input.token.elasticAddress,
      srcDecimals: input.token.decimals.toString(),
      amount: input.amountWei.toString(),
      destToken: output.token.elasticAddress,
      destDecimals: output.token.decimals.toString(),
      network: this.chainId.toString(),
    };

    const searchString = new URLSearchParams(queryParams);
    const pricesURL = `${SwapTokenLogic.apiUrl}/prices?${searchString}&excludeDEXS=${excludeDEXS}`;
    const {
      data: { priceRoute },
    } = await axios.get<{ priceRoute: OptimalRate }>(pricesURL);
    const { srcToken, srcDecimals, srcAmount, destToken, destDecimals, destAmount } = priceRoute;
    output.setWei(destAmount);

    const txConfig: BuildTxBody = {
      srcToken,
      srcDecimals,
      destToken,
      destDecimals,
      srcAmount,
      userAddress: account,
      partner,
      partnerAddress,
      slippage: slippage ?? 0,
      deadline: Math.floor(Date.now() / 1000) + 1200,
      priceRoute,
    };

    const { data } = await axios.post<TransactionParams>(txURL, txConfig);

    const inputs = [core.newLogicInput({ input })];
    const approveTo = getTokenTransferProxyAddress(this.chainId);
    return core.newLogic({ to: data.to, data: data.data, inputs, approveTo });
  }
}

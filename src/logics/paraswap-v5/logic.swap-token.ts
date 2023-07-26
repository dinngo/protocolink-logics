import { BuildSwapTxInput, SwapSide, constructSimpleSDK } from '@paraswap/sdk';
import { TokenList } from '@uniswap/token-lists';
import { axios } from 'src/utils';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { getTokenListUrls, supportedChainIds, tokenTransferProxyAddress } from './configs';

export type SwapTokenLogicTokenList = common.Token[];

export type SwapTokenLogicParams = core.TokenToTokenParams<{ slippage?: number }>;

export type SwapTokenLogicFields = core.TokenToTokenExactInFields<
  Pick<BuildSwapTxInput, 'partner' | 'partnerAddress'> & { slippage?: number }
>;

export type SwapTokenLogicOptions = Pick<core.GlobalOptions, 'account'>;

@core.LogicDefinitionDecorator()
export class SwapTokenLogic
  extends core.Logic
  implements core.LogicTokenListInterface, core.LogicOracleInterface, core.LogicBuilderInterface
{
  static readonly supportedChainIds = supportedChainIds;

  get sdk() {
    return constructSimpleSDK({ chainId: this.chainId, axios });
  }

  async getTokenList() {
    const tokenListUrls = getTokenListUrls(this.chainId);
    const tokenLists = await Promise.all(tokenListUrls.map((tokenListUrl) => axios.get<TokenList>(tokenListUrl)));

    const tmp: Record<string, boolean> = { [this.nativeToken.address]: true };
    const tokenList: SwapTokenLogicTokenList = [this.nativeToken];
    for (const { data } of tokenLists) {
      for (const { chainId, address, decimals, symbol, name } of data.tokens) {
        if (tmp[address] || chainId !== this.chainId || !name || !symbol || !decimals) continue;
        tokenList.push(new common.Token(chainId, address, decimals, symbol, name));
        tmp[address] = true;
      }
    }

    return tokenList;
  }

  async quote(params: SwapTokenLogicParams) {
    let input: common.TokenAmount;
    let output: common.TokenAmount;
    if (core.isTokenToTokenExactInParams(params)) {
      let tokenOut: common.Token;
      ({ input, tokenOut } = params);

      const { destAmount } = await this.sdk.swap.getRate({
        srcToken: input.token.elasticAddress,
        srcDecimals: input.token.decimals,
        amount: input.amountWei.toString(),
        destToken: tokenOut.elasticAddress,
        destDecimals: tokenOut.decimals,
        side: SwapSide.SELL,
      });
      output = new common.TokenAmount(tokenOut).setWei(destAmount);
    } else {
      let tokenIn: common.Token;
      ({ tokenIn, output } = params);

      const { srcAmount } = await this.sdk.swap.getRate({
        srcToken: tokenIn.elasticAddress,
        srcDecimals: tokenIn.decimals,
        amount: output.amountWei.toString(),
        destToken: output.token.elasticAddress,
        destDecimals: output.token.decimals,
        side: SwapSide.BUY,
      });
      input = new common.TokenAmount(tokenIn).setWei(srcAmount);
    }

    return { input, output, slippage: params.slippage };
  }

  async build(fields: SwapTokenLogicFields, options: SwapTokenLogicOptions) {
    const { input, output, partner, partnerAddress, slippage } = fields;
    const { account } = options;

    const priceRoute = await this.sdk.swap.getRate({
      srcToken: input.token.elasticAddress,
      amount: input.amountWei.toString(),
      destToken: output.token.elasticAddress,
    });
    const { srcToken, srcDecimals, srcAmount, destToken, destDecimals, destAmount } = priceRoute;
    output.setWei(destAmount);

    const { to, data } = await this.sdk.swap.buildTx(
      {
        srcToken,
        srcDecimals,
        destToken,
        destDecimals,
        srcAmount,
        userAddress: account,
        partner,
        partnerAddress,
        slippage: slippage ?? 0,
        deadline: (Math.floor(Date.now() / 1000) + 1200).toString(),
        priceRoute,
      },
      { ignoreChecks: true, ignoreGasEstimate: true }
    );
    const inputs = [core.newLogicInput({ input })];
    const approveTo = tokenTransferProxyAddress;

    return core.newLogic({ to, data, inputs, approveTo });
  }
}

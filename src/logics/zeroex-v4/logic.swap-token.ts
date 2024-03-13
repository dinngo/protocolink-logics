import * as core from '@protocolink/core';
import { getExchangeProxyAddress, getTokenListUrls, supportedChainIds } from './configs';
import * as common from '@protocolink/common';
import { axios } from 'src/utils/http';
import { getTokenList as getTokenListBase } from 'src/utils';
import invariant from 'tiny-invariant';
import { slippageToProtocolink, slippageToZeroEx } from 'src/logics/zeroex-v4/slippage';
import { isWrapOrUnwrap } from 'src/logics/zeroex-v4/utils';

export type SwapTokenLogicParams = core.TokenToTokenExactInParams<{
  excludedSources?: string[];
  apiKey: string;
}>;

export type SwapTokenLogicFields = core.TokenToTokenExactInFields<{
  slippage?: number;
  excludedSources?: string[];
  includedSources?: string[];
  apiKey: string;
}>;

export type ZeroExQuote = {
  sellAmount: string;
  buyAmount: string;
  data: string;
  to: string;
  expectedSlippage: string;
};

export type SwapTokenLogicOptions = Pick<core.GlobalOptions, 'account'>;

export class SwapTokenLogic
  extends core.Logic
  implements core.LogicTokenListInterface, core.LogicOracleInterface, core.LogicBuilderInterface
{
  static id = 'swap-token';
  static protocolId = 'zeroex-v4';
  static readonly supportedChainIds = supportedChainIds;

  async getTokenList() {
    return getTokenListBase(getTokenListUrls(this.chainId), this.chainId, [this.nativeToken]);
  }

  getAPIBaseUrl(chainId: number) {
    switch (chainId) {
      case common.ChainId.mainnet:
        return 'https://api.0x.org/';
      case common.ChainId.optimism:
        return 'https://optimism.api.0x.org/';
      case common.ChainId.polygon:
        return 'https://polygon.api.0x.org/';
      case common.ChainId.base:
        return 'https://base.api.0x.org/';
      case common.ChainId.arbitrum:
        return 'https://arbitrum.api.0x.org/';
      case common.ChainId.avalanche:
        return 'https://avalanche.api.0x.org/';
      default:
        throw new Error('Unsupported chain');
    }
  }

  getAPIHeaders(apiKey: string) {
    return {
      '0x-api-key': apiKey,
    };
  }

  async quote(params: SwapTokenLogicParams) {
    try {
      const { tokenOut, excludedSources, input, apiKey } = params;
      const url = this.getAPIBaseUrl(this.chainId) + `swap/v1/price`;
      const {
        data: { buyAmount, expectedSlippage },
      } = await axios.get<ZeroExQuote>(url, {
        params: {
          excludedSources: excludedSources?.join(','),
          sellToken: input.token.elasticAddress,
          buyToken: tokenOut.elasticAddress,
          sellAmount: input.amountWei.toString(),
        },
        headers: this.getAPIHeaders(apiKey),
      });

      return {
        input,
        apiKey,
        excludedSources,
        slippage: slippageToProtocolink(expectedSlippage),
        output: new common.TokenAmount(params.tokenOut).setWei(buyAmount),
      };
    } catch (e) {
      invariant(false, 'no route found or price impact too high');
    }
  }

  async build(fields: SwapTokenLogicFields, _: SwapTokenLogicOptions) {
    const { input, output, excludedSources, includedSources, slippage, apiKey } = fields;
    const slippagePercentage = slippageToZeroEx(slippage ?? 0);
    const url = this.getAPIBaseUrl(this.chainId) + `swap/v1/quote`;
    const {
      data: { buyAmount, data, to },
    } = await axios
      .get<ZeroExQuote>(url, {
        params: {
          slippagePercentage,
          excludedSources: excludedSources?.join(','),
          includedSources: includedSources?.join(','),
          sellToken: input.token.elasticAddress,
          buyToken: output.token.elasticAddress,
          sellAmount: input.amountWei.toString(),
        },
        headers: this.getAPIHeaders(apiKey),
      })
      .catch((e) => {
        return e;
      });
    output.setWei(buyAmount);

    const inputs = [core.newLogicInput({ input })];
    // if it's a wrap or an unwrap transaction we don't need to approve the exchange proxy
    // since it will be a plain deposit/withdraw on the WETH contract that's returned from the API
    const approveTo = isWrapOrUnwrap(input, output, this.nativeToken, this.wrappedNativeToken)
      ? undefined
      : getExchangeProxyAddress(this.chainId);

    return core.newLogic({ to, data, inputs, approveTo });
  }
}

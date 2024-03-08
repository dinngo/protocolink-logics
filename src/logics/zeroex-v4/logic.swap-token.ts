import * as core from '@protocolink/core';
import { getExchangeProxyAddress, getTokenListUrls, supportedChainIds } from './configs';
import * as common from '@protocolink/common';
import { axios } from 'src/utils/http';
import { getTokenList as getTokenListBase } from 'src/utils';
import invariant from 'tiny-invariant';

export type SwapTokenLogicParams = core.TokenToTokenExactInParams<{
  slippagePercentage?: number;
  excludedSources?: string[];
  includedSources?: string[];
  apiKey: string;
}>;

export type SwapTokenLogicFields = core.TokenToTokenExactInFields<{
  slippagePercentage?: number;
  excludedSources?: string[];
  includedSources?: string[];
  apiKey: string;
}>;

export type ZeroExQuote = {
  sellAmount: string;
  buyAmount: string;
  data: string;
  to: string;
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
      case common.ChainId.arbitrum:
        return 'https://arbitrum.api.0x.org/';
      case common.ChainId.base:
        return 'https://base.api.0x.org/';
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
      const { tokenOut, excludedSources, includedSources, input, slippagePercentage, apiKey } = params;
      const url = this.getAPIBaseUrl(this.chainId) + `swap/v1/quote`;
      const {
        data: { buyAmount },
      } = await axios.get<ZeroExQuote>(url, {
        params: {
          slippagePercentage,
          excludedSources: excludedSources?.join(','),
          includedSources: includedSources?.join(','),
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
        includedSources,
        slippagePercentage,
        output: new common.TokenAmount(params.tokenOut).setWei(buyAmount),
      };
    } catch (e) {
      invariant(false, 'no route found or price impact too high');
    }
  }

  async build(fields: SwapTokenLogicFields, _: SwapTokenLogicOptions) {
    const { input, output, excludedSources, includedSources, slippagePercentage, apiKey } = fields;

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
        console.log(e);
        return e;
      });
    output.setWei(buyAmount);

    const inputs = [core.newLogicInput({ input })];
    const approveTo = getExchangeProxyAddress(this.chainId);

    return core.newLogic({ data, to, approveTo, inputs });
  }
}

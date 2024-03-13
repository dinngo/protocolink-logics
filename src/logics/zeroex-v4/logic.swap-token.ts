import * as core from '@protocolink/core';
import { getExchangeProxyAddress, getTokenListUrls, supportedChainIds } from './configs';
import * as common from '@protocolink/common';
import { axios } from 'src/utils/http';
import { getTokenList as getTokenListBase } from 'src/utils';
import invariant from 'tiny-invariant';
import { isWrapOrUnwrap } from 'src/logics/zeroex-v4/utils';
import { slippageToZeroEx } from 'src/logics/zeroex-v4/slippage';

export type SwapTokenLogicParams = core.TokenToTokenExactInParams<{
  apiKey: string;
  slippage?: number;
  excludedSources?: string[];
  includedSources?: string[];
  skipValidation?: boolean;
  takerAddress?: string;
}>;

export type SwapTokenLogicFields = core.TokenToTokenExactInFields<{
  apiKey: string;
  slippage?: number;
  excludedSources?: string[];
  includedSources?: string[];
  skipValidation?: boolean;
  takerAddress?: string;
}>;

export type ZeroExQuote = {
  buyAmount: string;
  data: string;
  to: string;
  expectedSlippage?: string;
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
      const { input, tokenOut, slippage, excludedSources, includedSources, apiKey, takerAddress, skipValidation } =
        params;
      const slippagePercentage = slippage != null ? slippageToZeroEx(slippage) : undefined;
      const url = this.getAPIBaseUrl(this.chainId) + `swap/v1/price`;
      const {
        data: { buyAmount },
      } = await axios.get<ZeroExQuote>(url, {
        params: {
          slippagePercentage,
          sellToken: input.token.elasticAddress,
          buyToken: tokenOut.elasticAddress,
          sellAmount: input.amountWei.toString(),
          excludedSources: excludedSources?.join(','),
          includedSources: includedSources?.join(','),
          takerAddress,
          skipValidation,
        },
        headers: this.getAPIHeaders(apiKey),
      });

      return {
        input,
        output: new common.TokenAmount(params.tokenOut).setWei(buyAmount),
        slippage,
        excludedSources,
        includedSources,
        apiKey,
        takerAddress,
        skipValidation,
      };
    } catch (e) {
      invariant(false, 'no route found or price impact too high');
    }
  }

  async build(fields: SwapTokenLogicFields, _: SwapTokenLogicOptions) {
    const { input, output, slippage, excludedSources, includedSources, apiKey, takerAddress, skipValidation } = fields;
    const slippagePercentage = slippage != null ? slippageToZeroEx(slippage) : undefined;
    const url = this.getAPIBaseUrl(this.chainId) + `swap/v1/quote`;
    const {
      data: { buyAmount, data, to },
    } = await axios.get<ZeroExQuote>(url, {
      params: {
        slippagePercentage,
        sellToken: input.token.elasticAddress,
        buyToken: output.token.elasticAddress,
        sellAmount: input.amountWei.toString(),
        excludedSources: excludedSources?.join(','),
        includedSources: includedSources?.join(','),
        takerAddress,
        skipValidation,
      },
      headers: this.getAPIHeaders(apiKey),
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

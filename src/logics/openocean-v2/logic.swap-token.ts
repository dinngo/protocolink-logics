import { axios } from 'src/utils';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { getApiUrl, getGasPrice, supportedChainIds } from './configs';
import invariant from 'tiny-invariant';
import { slippageToOpenOcean, slippageToProtocolink } from './slippage';

export type SwapTokenLogicTokenList = common.Token[];

export type SwapTokenLogicParams = core.TokenToTokenExactInParams<{
  slippage?: number;
  disabledDexIds?: string;
}>;

export type SwapTokenLogicFields = core.TokenToTokenExactInFields<{
  slippage?: number;
  disabledDexIds?: string;
}>;

export type SwapTokenLogicOptions = Pick<core.GlobalOptions, 'account'>;

export class SwapTokenLogic
  extends core.Logic
  implements core.LogicTokenListInterface, core.LogicOracleInterface, core.LogicBuilderInterface
{
  static id = 'swap-token';
  static protocolId = 'openocean-v2';
  static readonly supportedChainIds = supportedChainIds;

  async getTokenList() {
    const url = getApiUrl(this.chainId);
    const resp = await axios.get(url + '/tokenList');
    const tokens = resp.data.data;
    const tokenList: SwapTokenLogicTokenList = [];
    for (const { address, decimals, symbol, name } of tokens) {
      tokenList.push(new common.Token(this.chainId, address, decimals, symbol, name));
    }
    return tokenList;
  }

  // If you wish to exclude quotes from a specific DEX, you can include the corresponding DEX ID
  // in the 'disabledDexIds' parameter. You can retrieve the DEX IDs from the following API:
  // https://open-api.openocean.finance/v3/{chainId}/dexList
  async quote(params: SwapTokenLogicParams) {
    const { input, tokenOut, disabledDexIds } = params;
    const url = getApiUrl(this.chainId);
    const gasPrice = getGasPrice(this.chainId);
    let slippage = slippageToOpenOcean(params.slippage ?? 0);

    const resp = await axios.get(url + '/quote', {
      params: {
        inTokenAddress: input.token.address,
        outTokenAddress: tokenOut.address,
        amount: input.amount,
        gasPrice,
        slippage,
        disabledDexIds,
      },
    });
    invariant(resp.data.code === 200, 'no route found or price impact too high');

    slippage = slippageToProtocolink(slippage);

    const { outAmount } = resp.data.data;
    const output = new common.TokenAmount(tokenOut).setWei(outAmount);
    return { input, output, slippage, disabledDexIds };
  }

  // Different gas_price will lead to different routes.
  // This is due to that OpenOcean calculates the best overall return.
  // The best overall return =  out_value - tx cost and the tx_cost = gas_used & gas_price
  async build(fields: SwapTokenLogicFields, options: SwapTokenLogicOptions) {
    const { input, output, disabledDexIds } = fields;
    const { account } = options;
    const url = getApiUrl(this.chainId);
    const gasPrice = getGasPrice(this.chainId);
    const agent = await this.calcAgent(account);
    const slippage = slippageToOpenOcean(fields.slippage ?? 0);

    const resp = await axios.get(url + '/swap_quote', {
      params: {
        inTokenAddress: input.token.address,
        outTokenAddress: output.token.address,
        amount: input.amount,
        gasPrice,
        slippage,
        account: agent,
        disabledDexIds,
      },
    });

    const { to, data } = resp.data.data;
    const inputs = [core.newLogicInput({ input })];
    return core.newLogic({ to, data, inputs });
  }
}

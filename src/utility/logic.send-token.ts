import axios from 'axios';
import axiosRetry from 'axios-retry';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { utils } from 'ethers';

axiosRetry(axios, { retries: 5, retryDelay: axiosRetry.exponentialDelay });

export type SendTokenLogicFields = core.TokenToUserFields;

@core.LogicDefinitionDecorator()
export class SendTokenLogic extends core.Logic implements core.LogicTokenListInterface {
  static readonly supportedChainIds = [
    common.ChainId.mainnet,
    common.ChainId.polygon,
    common.ChainId.arbitrum,
    common.ChainId.optimism,
    common.ChainId.avalanche,
    common.ChainId.fantom,
  ];

  async getTokenList() {
    const { data } = await axios.get<{
      tokens: Record<string, { symbol: string; name: string; decimals: number; address: string }>;
    }>(`https://api.1inch.io/v5.0/${this.chainId}/tokens`);
    const tokens = Object.keys(data.tokens).map((key) => {
      const token = data.tokens[key];
      const address = utils.getAddress(token.address);
      if (address === common.ELASTIC_ADDRESS) return this.nativeToken;
      return address === common.ELASTIC_ADDRESS
        ? this.nativeToken
        : new common.Token(this.chainId, address, token.decimals, token.symbol, token.name);
    });

    return tokens;
  }

  async build(fields: SendTokenLogicFields) {
    const { input, recipient, amountBps } = fields;

    const to = input.token.address;
    const data = common.ERC20__factory.createInterface().encodeFunctionData('transfer', [recipient, input.amountWei]);
    const inputs = [];
    if (amountBps) {
      inputs.push(core.newLogicInput({ input, amountBps, amountOffset: common.getParamOffset(1) }));
    }

    return core.newLogic({ to, data, inputs });
  }
}

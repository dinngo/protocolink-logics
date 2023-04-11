import { axios } from 'src/http';
import * as common from '@furucombo/composable-router-common';
import * as core from '@furucombo/composable-router-core';
import { utils } from 'ethers';

export type MultiSendLogicTokenList = common.Token[];

export type MultiSendLogicFields = core.TokenToUserFields[];

@core.LogicDefinitionDecorator()
export class MultiSendLogic extends core.Logic implements core.LogicTokenListInterface {
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

    const tokenList: MultiSendLogicTokenList = [];
    Object.keys(data.tokens).forEach((key) => {
      const token = data.tokens[key];
      const address = utils.getAddress(token.address);
      tokenList.push(
        address === common.ELASTIC_ADDRESS
          ? this.nativeToken
          : new common.Token(this.chainId, address, token.decimals, token.symbol, token.name)
      );
    });

    return tokenList;
  }
}

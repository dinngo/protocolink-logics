import { TokenList } from '@uniswap/token-lists';
import { axios } from 'src/utils';
import * as common from '@furucombo/composable-router-common';
import * as core from '@furucombo/composable-router-core';
import { getConfig, supportedChainIds } from './configs';
import * as univ3 from 'src/modules/univ3';

export type SwapTokenLogicTokenList = common.Token[];

export type SwapTokenLogicParams = univ3.SwapTokenLogicParams;

export type SwapTokenLogicFields = univ3.SwapTokenLogicFields;

export type SwapTokenLogicOptions = univ3.SwapTokenLogicOptions;

@core.LogicDefinitionDecorator()
export class SwapTokenLogic
  extends core.Logic
  implements core.LogicTokenListInterface, core.LogicOracleInterface, core.LogicBuilderInterface
{
  static readonly supportedChainIds = supportedChainIds;

  async getTokenList() {
    const { data } = await axios.get<TokenList>('https://gateway.ipfs.io/ipns/tokens.uniswap.org');

    const tmp: Record<string, boolean> = { [this.nativeToken.address]: true };
    const tokenList: SwapTokenLogicTokenList = [this.nativeToken];
    for (const { chainId, address, decimals, symbol, name } of data.tokens) {
      if (tmp[address] || chainId !== this.chainId) continue;
      tokenList.push(new common.Token(chainId, address, decimals, symbol, name));
      tmp[address] = true;
    }

    return tokenList;
  }

  async quote(params: SwapTokenLogicParams) {
    const service = new univ3.SwapTokenService({
      chainId: this.chainId,
      provider: this.provider,
      config: getConfig(this.chainId),
    });

    return service.quote(params);
  }

  async build(fields: SwapTokenLogicFields, options: SwapTokenLogicOptions) {
    const service = new univ3.SwapTokenService({
      chainId: this.chainId,
      provider: this.provider,
      config: getConfig(this.chainId),
    });

    return service.build(fields, options);
  }
}

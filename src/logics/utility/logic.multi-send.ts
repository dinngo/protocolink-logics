import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { get1InchTokens } from 'src/utils';

export type MultiSendLogicTokenList = common.Token[];

export type MultiSendLogicFields = core.TokenToUserFields[];

@core.LogicDefinitionDecorator()
export class MultiSendLogic extends core.Logic implements core.LogicTokenListInterface {
  static readonly supportedChainIds = common.networks.map(({ chainId }) => chainId);

  async getTokenList(): Promise<MultiSendLogicTokenList> {
    return get1InchTokens(this.chainId);
  }
}

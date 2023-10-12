import { SendTokenLogic } from './logic.send-token';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { get1InchTokens, getMetisTokens } from 'src/utils';

export type MultiSendLogicTokenList = common.Token[];

export type MultiSendLogicFields = core.TokenToUserFields[];

@core.LogicDefinitionDecorator()
export class MultiSendLogic
  extends core.Logic
  implements core.LogicTokenListInterface, core.LogicMultiBuilderInterface
{
  static readonly supportedChainIds = common.networks.map(({ chainId }) => chainId);

  async getTokenList(): Promise<MultiSendLogicTokenList> {
    if (this.chainId === 1088) return getMetisTokens();
    return get1InchTokens(this.chainId);
  }

  async build(fields: MultiSendLogicFields) {
    const sendTokenLogic = new SendTokenLogic(this.chainId, this.provider);
    const logics = await Promise.all(fields.map((field) => sendTokenLogic.build(field)));

    return logics;
  }
}

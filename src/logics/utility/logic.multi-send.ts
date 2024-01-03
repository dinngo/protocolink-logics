import { SendTokenLogic } from './logic.send-token';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { get1InchTokens, getGoerliTokens, getMetisTokens } from 'src/utils';

export type MultiSendLogicTokenList = common.Token[];

export type MultiSendLogicFields = core.TokenToUserFields[];

export class MultiSendLogic
  extends core.Logic
  implements core.LogicTokenListInterface, core.LogicMultiBuilderInterface
{
  static id = 'multi-send';
  static protocolId = 'utility';
  static readonly supportedChainIds = common.networks.map(({ chainId }) => chainId);

  async getTokenList(): Promise<MultiSendLogicTokenList> {
    return this.chainId === common.ChainId.metis
      ? await getMetisTokens()
      : this.chainId === common.ChainId.goerli
      ? getGoerliTokens()
      : await get1InchTokens(this.chainId);
  }

  async build(fields: MultiSendLogicFields) {
    const sendTokenLogic = new SendTokenLogic(this.chainId, this.provider);
    const logics = await Promise.all(fields.map((field) => sendTokenLogic.build(field)));

    return logics;
  }
}

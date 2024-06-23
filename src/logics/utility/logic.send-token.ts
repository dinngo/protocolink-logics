import { BigNumberish } from 'ethers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { getUnifiedTokens } from 'src/utils';

export type SendTokenLogicTokenList = common.Token[];

export type SendTokenLogicFields = core.TokenToUserFields;

export class SendTokenLogic extends core.Logic implements core.LogicTokenListInterface, core.LogicBuilderInterface {
  static id = 'send-token';
  static protocolId = 'utility';
  static readonly supportedChainIds = common.networks.map(({ chainId }) => chainId);

  async getTokenList(): Promise<SendTokenLogicTokenList> {
    return await getUnifiedTokens(this.chainId);
  }

  async build(fields: SendTokenLogicFields) {
    const { input, recipient, balanceBps } = fields;

    let to: string;
    let data: string;
    let amountOffset: BigNumberish | undefined;
    if (input.token.isNative) {
      to = recipient;
      data = '0x';
      if (balanceBps) amountOffset = core.OFFSET_NOT_USED;
    } else {
      to = input.token.address;
      data = common.ERC20__factory.createInterface().encodeFunctionData('transfer', [recipient, input.amountWei]);
      if (balanceBps) amountOffset = common.getParamOffset(1);
    }
    const inputs = [core.newLogicInput({ input, balanceBps, amountOffset })];

    return core.newLogic({ to, data, inputs });
  }
}

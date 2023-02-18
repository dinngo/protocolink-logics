import * as common from '@composable-router/common';
import * as core from '@composable-router/core';

export type SendTokenLogicFields = core.TokenToUserFields;

@core.LogicDefinitionDecorator()
export class SendTokenLogic extends core.Logic {
  static readonly supportedChainIds = [
    common.ChainId.mainnet,
    common.ChainId.polygon,
    common.ChainId.arbitrum,
    common.ChainId.optimism,
    common.ChainId.avalanche,
  ];

  async getLogic(fields: SendTokenLogicFields) {
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

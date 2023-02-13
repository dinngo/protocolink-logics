import * as core from 'src/core';
import * as rt from 'src/router';

export type SendTokenLogicGetLogicOptions = rt.logics.TokenToUserData;

export class SendTokenLogic extends rt.logics.LogicBase {
  async getLogic(options: SendTokenLogicGetLogicOptions) {
    const { input, recipient, amountBps } = options;

    const to = input.token.address;
    const data = core.contracts.ERC20__factory.createInterface().encodeFunctionData('transfer', [
      recipient,
      input.amountWei,
    ]);
    const inputs = [];
    if (amountBps) {
      inputs.push(rt.logics.newLogicInput({ input, amountBps, amountOffset: core.utils.getParamOffset(1) }));
    }

    return rt.logics.newLogic({ to, data, inputs });
  }
}

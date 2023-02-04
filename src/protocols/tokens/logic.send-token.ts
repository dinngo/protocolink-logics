import { constants } from 'ethers';
import * as core from 'src/core';
import * as rt from 'src/router';

export type SendTokenLogicGetLogicOptions = rt.logics.TokenToUserData;

export class SendTokenLogic extends rt.logics.LogicBase {
  async getLogic(options: SendTokenLogicGetLogicOptions) {
    const { input, recipient } = options;

    const iface = core.contracts.ERC20__factory.createInterface();
    const data = iface.encodeFunctionData('transfer', [recipient, input.amountWei]);

    return {
      to: input.token.address,
      data,
      inputs: [],
      outputs: [],
      callback: constants.AddressZero,
    };
  }
}

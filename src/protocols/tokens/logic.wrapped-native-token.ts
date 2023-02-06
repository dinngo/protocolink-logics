import { constants } from 'ethers';
import * as core from 'src/core';
import * as rt from 'src/router';

export type WrappedNativeTokenLogicGetPriceOptions = rt.logics.TokenToTokenExactInData;

export type WrappedNativeTokenLogicGetLogicOptions = rt.logics.TokenToTokenData;

export class WrappedNativeTokenLogic extends rt.logics.LogicBase implements rt.logics.TokenToTokenLogicInterface {
  async getPrice(options: WrappedNativeTokenLogicGetPriceOptions) {
    const { input, tokenOut } = options;
    const output = new core.tokens.TokenAmount(tokenOut, input.amount);
    return output;
  }

  async getLogic(options: WrappedNativeTokenLogicGetLogicOptions) {
    const { input } = options;

    const iface = core.contracts.WETH__factory.createInterface();
    const data = input.token.isNative()
      ? iface.encodeFunctionData('deposit')
      : iface.encodeFunctionData('withdraw', [input.amountWei]);

    return {
      to: this.networkConfig.wrappedNativeToken.address,
      data,
      inputs: [rt.logics.newLogicInput({ input })],
      outputs: [],
      callback: constants.AddressZero,
    };
  }
}

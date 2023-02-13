import { BigNumberish, constants } from 'ethers';
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
    const { input, amountBps } = options;

    const to = this.wrappedNativeToken.address;
    const iface = core.contracts.WETH__factory.createInterface();
    let data: string;
    let amountOffset: BigNumberish | undefined;
    if (input.token.isNative()) {
      data = iface.encodeFunctionData('deposit');
      if (amountBps) amountOffset = constants.MaxUint256;
    } else {
      data = iface.encodeFunctionData('withdraw', [input.amountWei]);
      if (amountBps) amountOffset = core.utils.getParamOffset(0);
    }
    const inputs = [rt.logics.newLogicInput({ input, amountBps, amountOffset })];

    return rt.logics.newLogic({ to, data, inputs });
  }
}

import { BigNumber, BigNumberish, constants } from 'ethers';
import { CErc20__factory, CEther__factory } from './contracts';
import * as core from 'src/core';
import * as rt from 'src/router';

export type CompoundV2SupplyLogicGetPriceOptions = rt.logics.TokenToTokenExactInData;

export type CompoundV2SupplyLogicGetLogicOptions = rt.logics.TokenToTokenData;

export class CompoundV2SupplyLogic extends rt.logics.LogicBase implements rt.logics.TokenToTokenLogicInterface {
  async getPrice(options: CompoundV2SupplyLogicGetPriceOptions) {
    const { input, tokenOut } = options;
    const cToken = CErc20__factory.connect(tokenOut.address, this.provider);
    const exchangeRateCurrent = await cToken.callStatic.exchangeRateCurrent();
    const amountOutWei = input.amountWei.mul(BigNumber.from(10).pow(18)).div(exchangeRateCurrent);
    const output = new core.tokens.TokenAmount(tokenOut).setWei(amountOutWei);

    return output;
  }

  async getLogic(options: CompoundV2SupplyLogicGetLogicOptions) {
    const { input, output, amountBps } = options;

    const to = output.token.address;
    let data: string;
    let amountOffset: BigNumberish | undefined;
    if (input.token.isNative()) {
      data = CEther__factory.createInterface().encodeFunctionData('mint');
      if (amountBps) amountOffset = constants.MaxUint256;
    } else {
      data = CErc20__factory.createInterface().encodeFunctionData('mint', [input.amountWei]);
      if (amountBps) amountOffset = core.utils.getParamOffset(0);
    }
    const inputs = [rt.logics.newLogicInput({ input, amountBps, amountOffset })];

    return rt.logics.newLogic({ to, data, inputs });
  }
}

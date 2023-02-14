import { BigNumber, BigNumberish } from 'ethers';
import { CErc20__factory } from './contracts';
import * as core from 'src/core';
import * as rt from 'src/router';

export type CompoundV2WithdrawLogicGetPriceOptions = rt.logics.TokenToTokenExactInData;

export type CompoundV2WithdrawLogicGetLogicOptions = rt.logics.TokenToTokenData;

export class CompoundV2WithdrawLogic extends rt.logics.LogicBase implements rt.logics.TokenToTokenLogicInterface {
  async getPrice(options: CompoundV2WithdrawLogicGetPriceOptions) {
    const { input, tokenOut } = options;
    const cToken = CErc20__factory.connect(input.token.address, this.provider);
    const exchangeRateCurrent = await cToken.callStatic.exchangeRateCurrent();
    const amountOutWei = input.amountWei.mul(exchangeRateCurrent).div(BigNumber.from(10).pow(18));
    const output = new core.tokens.TokenAmount(tokenOut).setWei(amountOutWei);

    return output;
  }

  async getLogic(options: CompoundV2WithdrawLogicGetLogicOptions) {
    const { input, amountBps } = options;

    const to = input.token.address;
    const data = CErc20__factory.createInterface().encodeFunctionData('redeem', [input.amountWei]);
    let amountOffset: BigNumberish | undefined;
    if (amountBps) amountOffset = core.utils.getParamOffset(0);
    const inputs = [rt.logics.newLogicInput({ input, amountBps, amountOffset })];

    return rt.logics.newLogic({ to, data, inputs });
  }
}

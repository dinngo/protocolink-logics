import { AaveV2Service } from './service';
import { BigNumberish } from 'ethers';
import { InterestRateMode } from './types';
import { LendingPool__factory } from './contracts';
import * as core from 'src/core';
import invariant from 'tiny-invariant';
import * as rt from 'src/router';

export type AaveV2RepayLogicGetLogicOptions = rt.logics.TokenInData &
  Pick<rt.RouterGlobalOptions, 'account'> & { interestRateMode: InterestRateMode };

export class AaveV2RepayLogic extends rt.logics.LogicBase {
  service: AaveV2Service;

  constructor(options: rt.logics.LogicBaseOptions) {
    super(options);
    this.service = new AaveV2Service(options);
  }

  async getDebt(user: string, asset: core.tokens.Token, interestRateMode: InterestRateMode) {
    const { currentStableDebt, currentVariableDebt } = await this.service.protocolDataProvider.getUserReserveData(
      asset.address,
      user
    );
    const currentDebt = interestRateMode === InterestRateMode.variable ? currentVariableDebt : currentStableDebt;
    const amountWei = core.utils.calcSlippage(currentDebt, -100); // slightly higher than the current borrowed amount
    const debt = new core.tokens.TokenAmount(asset).setWei(amountWei);

    return debt;
  }

  async getLogic(options: AaveV2RepayLogicGetLogicOptions) {
    const { account, input, interestRateMode, amountBps } = options;
    invariant(!input.token.isNative(), 'tokenIn should not be native token');

    const to = await this.service.getLendingPoolAddress();
    const data = LendingPool__factory.createInterface().encodeFunctionData('repay', [
      input.token.address,
      input.amountWei,
      interestRateMode,
      account,
    ]);
    let amountOffset: BigNumberish | undefined;
    if (amountBps) amountOffset = core.utils.getParamOffset(1);
    const inputs = [rt.logics.newLogicInput({ input, amountBps, amountOffset })];

    return rt.logics.newLogic({ to, data, inputs });
  }
}

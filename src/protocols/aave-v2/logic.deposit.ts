import { AaveV2Service } from './service';
import { BigNumberish } from 'ethers';
import { LendingPool__factory } from './contracts';
import * as core from 'src/core';
import invariant from 'tiny-invariant';
import * as rt from 'src/router';

export type AaveV2DepositLogicGetPriceOptions = rt.logics.TokenToTokenExactInData;

export type AaveV2DepositLogicGetLogicOptions = rt.logics.TokenToTokenData &
  Pick<rt.RouterGlobalOptions, 'routerAddress'> & { referralCode?: number };

export class AaveV2DepositLogic extends rt.logics.LogicBase implements rt.logics.TokenToTokenLogicInterface {
  service: AaveV2Service;

  constructor(options: rt.logics.LogicBaseOptions) {
    super(options);
    this.service = new AaveV2Service(options);
  }

  async getPrice(options: AaveV2DepositLogicGetPriceOptions) {
    const { input, tokenOut } = options;
    invariant(!input.token.isNative(), 'tokenIn should not be native token');

    const output = new core.tokens.TokenAmount(tokenOut, input.amount);

    return output;
  }

  async getLogic(options: AaveV2DepositLogicGetLogicOptions) {
    const { input, amountBps, routerAddress, referralCode = 0 } = options;
    invariant(!input.token.isNative(), 'tokenIn should not be native token');

    const to = await this.service.getLendingPoolAddress();
    const data = LendingPool__factory.createInterface().encodeFunctionData('deposit', [
      input.token.address,
      input.amountWei,
      routerAddress,
      referralCode,
    ]);
    let amountOffset: BigNumberish | undefined;
    if (amountBps) amountOffset = core.utils.getParamOffset(1);
    const inputs = [rt.logics.newLogicInput({ input, amountBps, amountOffset })];

    return rt.logics.newLogic({ to, data, inputs });
  }
}

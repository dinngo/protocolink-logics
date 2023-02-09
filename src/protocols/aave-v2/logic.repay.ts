import { AaveV2Service } from './service';
import { InterestRateMode } from './types';
import { LendingPool__factory } from './contracts';
import { constants } from 'ethers';
import invariant from 'tiny-invariant';
import * as rt from 'src/router';

export type AaveV2RepayLogicGetPriceOptions = rt.logics.TokenInData;

export type AaveV2RepayLogicGetLogicOptions = rt.logics.TokenInData &
  Pick<rt.RouterGlobalOptions, 'account'> & { interestRateMode: InterestRateMode };

export class AaveV2RepayLogic extends rt.logics.LogicBase {
  service: AaveV2Service;

  constructor(options: rt.logics.LogicBaseOptions) {
    super(options);
    this.service = new AaveV2Service(options);
  }

  async getLogic(options: AaveV2RepayLogicGetLogicOptions) {
    const { input, account, interestRateMode } = options;
    invariant(!input.token.isNative(), 'tokenIn should not be native token');

    const to = await this.service.getLendingPoolAddress();
    const data = LendingPool__factory.createInterface().encodeFunctionData('repay', [
      input.token.address,
      input.amountWei,
      interestRateMode,
      account,
    ]);

    return { to, data, inputs: [rt.logics.newLogicInput({ input })], outputs: [], callback: constants.AddressZero };
  }
}

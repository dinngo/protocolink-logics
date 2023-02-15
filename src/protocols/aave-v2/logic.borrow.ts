import { InterestRateMode } from './types';
import { SpenderAaveV2Delegation__factory } from './contracts';
import { getContractAddress } from './config';
import invariant from 'tiny-invariant';
import * as rt from 'src/router';

export type AaveV2BorrowLogicGetLogicOptions = rt.logics.TokenOutData & { interestRateMode: InterestRateMode };

export class AaveV2BorrowLogic extends rt.logics.LogicBase {
  readonly delegateeAddress: string;

  constructor(options: rt.logics.LogicBaseOptions<{ delegateeAddress?: string }>) {
    const { delegateeAddress, ...others } = options;
    super(others);
    this.delegateeAddress = delegateeAddress ?? getContractAddress(this.chainId, 'SpenderAaveV2Delegation');
  }

  async getLogic(options: AaveV2BorrowLogicGetLogicOptions) {
    const { output, interestRateMode } = options;
    invariant(!output.token.isNative(), 'tokenOut should not be native token');

    const to = this.delegateeAddress;
    const data = SpenderAaveV2Delegation__factory.createInterface().encodeFunctionData('borrow', [
      output.token.address,
      output.amountWei,
      interestRateMode,
    ]);

    return rt.logics.newLogic({ to, data });
  }
}

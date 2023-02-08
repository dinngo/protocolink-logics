import { InterestRateMode } from './types';
import { constants } from 'ethers';
import * as rt from 'src/router';

export type AaveV2BorrowLogicGetLogicOptions = rt.logics.TokenOutData & { interestRateMode: InterestRateMode };

export class AaveV2BorrowLogic extends rt.logics.LogicBase {
  delegateeAddress: string;

  constructor(options: rt.logics.LogicBaseOptions<{ delegateeAddress?: string }>) {
    const { delegateeAddress, ...others } = options;
    super(others);
    this.delegateeAddress = delegateeAddress ?? rt.config.getContractAddress(this.chainId, 'SpenderAaveV2Delegation');
  }

  async getLogic(options: AaveV2BorrowLogicGetLogicOptions) {
    const { output, interestRateMode } = options;

    const to = this.delegateeAddress;
    const data = rt.contracts.SpenderAaveV2Delegation__factory.createInterface().encodeFunctionData('borrow', [
      output.token.address,
      output.amountWei,
      interestRateMode,
    ]);

    return { to, data, inputs: [], outputs: [rt.logics.newLogicOutput({ output })], callback: constants.AddressZero };
  }
}

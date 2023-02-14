import { BigNumberish, constants } from 'ethers';
import { CErc20__factory, CEther__factory } from './contracts';
import * as core from 'src/core';
import * as rt from 'src/router';
import { toCToken } from './tokens';

export type CompoundV2RepayLogicGetPriceOptions = rt.logics.TokenToTokenExactInData;

export type CompoundV2RepayLogicGetLogicOptions = rt.logics.TokenInData & { borrower: string };

export class CompoundV2RepayLogic extends rt.logics.LogicBase {
  async getLogic(options: CompoundV2RepayLogicGetLogicOptions) {
    const { borrower, input, amountBps } = options;
    const cToken = toCToken(input.token);

    const to = cToken.address;
    let data: string;
    let amountOffset: BigNumberish | undefined;
    if (input.token.isNative()) {
      data = CEther__factory.createInterface().encodeFunctionData('repayBorrowBehalf', [borrower]);
      if (amountBps) amountOffset = constants.MaxUint256;
    } else {
      data = CErc20__factory.createInterface().encodeFunctionData('repayBorrowBehalf', [borrower, input.amountWei]);
      if (amountBps) amountOffset = core.utils.getParamOffset(1);
    }
    const inputs = [rt.logics.newLogicInput({ input, amountBps, amountOffset })];

    return rt.logics.newLogic({ to, data, inputs });
  }
}

import { BigNumberish, constants } from 'ethers';
import { CErc20__factory, CEther__factory } from './contracts';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { toCToken, underlyingTokens } from './tokens';

export type RepayLogicFields = core.TokenInFields<{ borrower: string }>;

@core.LogicDefinitionDecorator()
export class RepayLogic extends core.Logic implements core.LogicTokenListInterface {
  static readonly supportedChainIds = [common.ChainId.mainnet];

  getTokenList() {
    return Object.values(underlyingTokens);
  }

  async getDebt(borrower: string, underlyingToken: common.Token) {
    const cToken = toCToken(underlyingToken);
    const cTokenContract = CErc20__factory.connect(cToken.address, this.provider);
    const borrowBalanceWei = await cTokenContract.callStatic.borrowBalanceCurrent(borrower);
    const debt = new common.TokenAmount(underlyingToken).setWei(borrowBalanceWei);

    return debt;
  }

  async getLogic(fields: RepayLogicFields) {
    const { borrower, input, amountBps } = fields;
    const cToken = toCToken(input.token);

    const to = cToken.address;
    let data: string;
    let amountOffset: BigNumberish | undefined;
    if (input.token.isNative) {
      data = CEther__factory.createInterface().encodeFunctionData('repayBorrowBehalf', [borrower]);
      if (amountBps) amountOffset = constants.MaxUint256;
    } else {
      data = CErc20__factory.createInterface().encodeFunctionData('repayBorrowBehalf', [borrower, input.amountWei]);
      if (amountBps) amountOffset = common.getParamOffset(1);
    }
    const inputs = [core.newLogicInput({ input, amountBps, amountOffset })];

    return core.newLogic({ to, data, inputs });
  }
}

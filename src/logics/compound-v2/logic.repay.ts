import { BigNumberish } from 'ethers';
import { CErc20__factory, CEther__factory } from './contracts';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { supportedChainIds, toCToken, underlyingTokens } from './configs';

export type RepayLogicTokenList = common.Token[];

export type RepayLogicParams = core.RepayParams;

export type RepayLogicFields = core.RepayFields;

@core.LogicDefinitionDecorator()
export class RepayLogic
  extends core.Logic
  implements core.LogicTokenListInterface, core.LogicOracleInterface, core.LogicBuilderInterface
{
  static readonly supportedChainIds = supportedChainIds;

  getTokenList() {
    return underlyingTokens;
  }

  async quote(params: RepayLogicParams) {
    const { borrower, tokenIn } = params;

    const cToken = toCToken(tokenIn);
    const borrowBalanceWei = await CErc20__factory.connect(
      cToken.address,
      this.provider
    ).callStatic.borrowBalanceCurrent(borrower);
    const input = new common.TokenAmount(tokenIn).setWei(borrowBalanceWei);

    return { borrower, input };
  }

  async build(fields: RepayLogicFields) {
    const { borrower, input, balanceBps } = fields;
    const cToken = toCToken(input.token);

    const to = cToken.address;
    let data: string;
    let amountOffset: BigNumberish | undefined;
    if (input.token.isNative) {
      data = CEther__factory.createInterface().encodeFunctionData('repayBorrowBehalf', [borrower]);
      if (balanceBps) amountOffset = core.OFFSET_NOT_USED;
    } else {
      data = CErc20__factory.createInterface().encodeFunctionData('repayBorrowBehalf', [borrower, input.amountWei]);
      if (balanceBps) amountOffset = common.getParamOffset(1);
    }
    const inputs = [core.newLogicInput({ input, balanceBps, amountOffset })];

    return core.newLogic({ to, data, inputs });
  }
}

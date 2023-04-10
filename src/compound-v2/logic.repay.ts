import { BigNumberish, constants } from 'ethers';
import { CErc20__factory, CEther__factory } from './contracts';
import * as common from '@furucombo/composable-router-common';
import * as core from '@furucombo/composable-router-core';
import { toCToken, underlyingTokens } from './tokens';

export type RepayLogicTokenList = common.Token[];

export type RepayLogicParams = core.RepayParams;

export type RepayLogicFields = core.RepayFields;

@core.LogicDefinitionDecorator()
export class RepayLogic extends core.Logic implements core.LogicTokenListInterface, core.LogicOracleInterface {
  static readonly supportedChainIds = [common.ChainId.mainnet];

  getTokenList() {
    const tokenList: RepayLogicTokenList = Object.values(underlyingTokens);
    return tokenList;
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

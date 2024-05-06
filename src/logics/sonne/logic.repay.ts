import { CErc20Immutable__factory } from './contracts';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { supportedChainIds, toCToken, tokenPairs } from './configs';

export type RepayLogicTokenList = [common.Token][];

export type RepayLogicParams = core.RepayParams;

export type RepayLogicFields = core.RepayFields;

export class RepayLogic
  extends core.Logic
  implements core.LogicTokenListInterface, core.LogicOracleInterface, core.LogicBuilderInterface
{
  static id = 'repay';
  static protocolId = 'sonne';
  static readonly supportedChainIds = supportedChainIds;

  getTokenList() {
    const tokenList: RepayLogicTokenList = tokenPairs[this.chainId].map(({ underlyingToken }) => [underlyingToken]);
    return tokenList;
  }

  async quote(params: RepayLogicParams) {
    const { borrower, tokenIn } = params;

    const cToken = toCToken(this.chainId, tokenIn);
    const borrowBalanceWei = await CErc20Immutable__factory.connect(
      cToken.address,
      this.provider
    ).callStatic.borrowBalanceCurrent(borrower);
    const input = new common.TokenAmount(tokenIn).setWei(borrowBalanceWei);

    return { borrower, input };
  }

  async build(fields: RepayLogicFields) {
    const { borrower, input, balanceBps } = fields;
    const cToken = toCToken(this.chainId, input.token);

    const to = cToken.address;
    const data = CErc20Immutable__factory.createInterface().encodeFunctionData('repayBorrowBehalf', [
      borrower,
      input.amountWei,
    ]);

    const amountOffset = balanceBps ? common.getParamOffset(1) : undefined;
    const inputs = [core.newLogicInput({ input, balanceBps, amountOffset })];
    const wrapMode = input.token.isNative ? core.WrapMode.wrapBefore : core.WrapMode.none;

    return core.newLogic({ to, data, inputs, wrapMode });
  }
}

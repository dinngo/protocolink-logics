import { InterestRateMode, LogicOptions, serviceType } from './types';
import { Pool__factory } from './contracts';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';

export type RepayLogicTokenList = common.Token[];

export type RepayLogicParams = core.RepayParams<{ interestRateMode: InterestRateMode }>;

export type RepayLogicFields = core.RepayFields<{ interestRateMode: InterestRateMode }>;

export abstract class RepayLogic extends core.Logic {
  static id = 'repay';
  public readonly service: serviceType;

  constructor({ chainId, provider, service }: LogicOptions) {
    super(chainId, provider);
    this.service = service;
  }

  async getTokenList() {
    const tokens = await this.service.getAssets();

    const tokenList: RepayLogicTokenList = [];
    for (const token of tokens) {
      if (token.isWrapped) {
        tokenList.push(token.unwrapped);
      }
      tokenList.push(token);
    }

    return tokenList;
  }

  async quote(params: RepayLogicParams) {
    const { borrower, tokenIn, interestRateMode } = params;

    const { currentStableDebt, currentVariableDebt } = await this.service.poolDataProvider.getUserReserveData(
      tokenIn.wrapped.address,
      borrower
    );
    const currentDebt = interestRateMode === InterestRateMode.variable ? currentVariableDebt : currentStableDebt;
    const amountWei = common.calcSlippage(currentDebt, -1); // slightly higher than the current borrowed amount
    const input = new common.TokenAmount(tokenIn).setWei(amountWei);

    return { borrower, interestRateMode, input };
  }

  async build(fields: RepayLogicFields) {
    const { input, interestRateMode, borrower, balanceBps } = fields;

    const tokenIn = input.token.wrapped;

    const to = await this.service.getPoolAddress();
    const data = Pool__factory.createInterface().encodeFunctionData('repay', [
      tokenIn.address,
      input.amountWei,
      interestRateMode,
      borrower,
    ]);
    const amountOffset = balanceBps ? common.getParamOffset(1) : undefined;
    const inputs = [
      core.newLogicInput({ input: new common.TokenAmount(tokenIn, input.amount), balanceBps, amountOffset }),
    ];
    const wrapMode = input.token.isNative ? core.WrapMode.wrapBefore : core.WrapMode.none;

    return core.newLogic({ to, data, inputs, wrapMode });
  }
}

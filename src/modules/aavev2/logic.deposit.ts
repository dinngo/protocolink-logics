import { LendingPool__factory } from './contracts';
import { LogicOptions, serviceType } from './types';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';

export type DepositLogicTokenList = [common.Token, common.Token][];

export type DepositLogicParams = core.TokenToTokenExactInParams;

export type DepositLogicFields = core.TokenToTokenExactInFields<{ referralCode?: number }>;

export type DepositLogicOptions = Pick<core.GlobalOptions, 'account'>;

export class DepositLogics extends core.Logic {
  static id = 'deposit';
  public readonly service: serviceType;

  constructor({ chainId, provider, service }: LogicOptions) {
    super(chainId, provider);
    this.service = service;
  }

  async quote(params: DepositLogicParams) {
    const { input, tokenOut } = params;
    const output = new common.TokenAmount(tokenOut, input.amount);

    return { input, output };
  }

  async build(fields: DepositLogicFields, options: DepositLogicOptions) {
    const { input, balanceBps, referralCode = 0 } = fields;
    const { account } = options;

    const tokenIn = input.token.wrapped;
    const agent = await this.calcAgent(account);

    const to = await this.service.getLendingPoolAddress();
    const data = LendingPool__factory.createInterface().encodeFunctionData('deposit', [
      tokenIn.address,
      input.amountWei,
      agent,
      referralCode,
    ]);
    const amountOffset = balanceBps ? common.getParamOffset(1) : undefined;
    const inputs = [
      core.newLogicInput({ input: new common.TokenAmount(tokenIn, input.amount), balanceBps, amountOffset }),
    ];
    const wrapMode = input.token.isNative ? core.WrapMode.wrapBefore : core.WrapMode.none;

    return core.newLogic({ to, data, inputs, wrapMode });
  }
}

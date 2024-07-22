import { InterestRateMode, LogicOptions, serviceType } from './types';
import { LendingPool__factory } from './contracts';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';

export type BorrowLogicTokenList = common.Token[];

export type BorrowLogicFields = core.TokenOutFields<{ interestRateMode: InterestRateMode; referralCode?: number }>;

export type BorrowLogicOptions = Pick<core.GlobalOptions, 'account'>;

export abstract class BorrowLogic extends core.Logic {
  static id = 'borrow';
  public readonly service: serviceType;

  constructor({ chainId, provider, service }: LogicOptions) {
    super(chainId, provider);
    this.service = service;
  }

  async getTokenList() {
    const borrowTokens = await this.service.getBorrowTokens();

    const tokenList: BorrowLogicTokenList = [];
    for (const { asset } of borrowTokens) {
      if (asset.isWrapped) {
        tokenList.push(asset.unwrapped);
      }
      tokenList.push(asset);
    }

    return tokenList;
  }

  async build(fields: BorrowLogicFields, options: BorrowLogicOptions) {
    const { output, interestRateMode, referralCode = 0 } = fields;
    const { account } = options;

    const tokenOut = output.token.wrapped;

    const to = await this.service.getLendingPoolAddress();
    const data = LendingPool__factory.createInterface().encodeFunctionData('borrow', [
      tokenOut.address,
      output.amountWei,
      interestRateMode,
      referralCode,
      account,
    ]);
    const wrapMode = output.token.isNative ? core.WrapMode.unwrapAfter : core.WrapMode.none;

    return core.newLogic({ to, data, wrapMode });
  }
}

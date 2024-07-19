import { InterestRateMode } from './types';
import { LendingPool__factory } from './contracts';
import { Service } from './service';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { supportedChainIds } from './configs';

export type BorrowLogicTokenList = common.Token[];

export type BorrowLogicFields = core.TokenOutFields<{ interestRateMode: InterestRateMode; referralCode?: number }>;

export type BorrowLogicOptions = Pick<core.GlobalOptions, 'account'>;

export class BorrowLogic extends core.Logic implements core.LogicTokenListInterface, core.LogicBuilderInterface {
  static id = 'borrow';
  static protocolId = 'radiant-v2';
  static readonly supportedChainIds = supportedChainIds;

  async getTokenList() {
    const service = new Service(this.chainId, this.provider);
    const reserveTokens = await service.getBorrowTokens();

    const tokenList: BorrowLogicTokenList = [];
    for (const { asset } of reserveTokens) {
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

    const service = new Service(this.chainId, this.provider);
    const to = await service.getLendingPoolAddress();
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

import { InterestRateMode } from './types';
import { LendingPool__factory } from './contracts';
import { Service } from './service';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';

export type BorrowLogicFields = core.TokenOutFields<{ interestRateMode: InterestRateMode; referralCode?: number }>;

export type BorrowLogicOptions = Pick<core.GlobalOptions, 'account'>;

@core.LogicDefinitionDecorator()
export class BorrowLogic extends core.Logic implements core.LogicTokenListInterface {
  static readonly supportedChainIds = [common.ChainId.mainnet, common.ChainId.polygon, common.ChainId.avalanche];

  async getTokenList() {
    const service = new Service(this.chainId, this.provider);
    const tokens = await service.getAssets();

    const tokenList: common.Token[] = [];
    for (const token of tokens) {
      if (token.isWrapped) {
        tokenList.push(token.unwrapped);
      }
      tokenList.push(token);
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

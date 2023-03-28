import { InterestRateMode } from './types';
import { Pool__factory } from './contracts';
import { Service } from './service';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import invariant from 'tiny-invariant';

export type BorrowLogicFields = core.TokenOutFields<{ interestRateMode: InterestRateMode; referralCode?: number }>;

export type BorrowLogicOptions = Pick<core.GlobalOptions, 'account'>;

@core.LogicDefinitionDecorator()
export class BorrowLogic extends core.Logic implements core.LogicTokenListInterface {
  static readonly supportedChainIds = [common.ChainId.mainnet, common.ChainId.polygon, common.ChainId.avalanche];

  async getTokenList() {
    const service = new Service(this.chainId, this.provider);
    const tokens = await service.getAssets();

    return tokens;
  }

  async getLogic(fields: BorrowLogicFields, options: BorrowLogicOptions) {
    const { output, interestRateMode, referralCode = 0 } = fields;
    invariant(!output.token.isNative, 'tokenOut should not be native token');
    const { account } = options;

    const service = new Service(this.chainId, this.provider);
    const to = await service.getPoolAddress();
    const data = Pool__factory.createInterface().encodeFunctionData('borrow', [
      output.token.address,
      output.amountWei,
      interestRateMode,
      referralCode,
      account,
    ]);

    return core.newLogic({ to, data });
  }
}

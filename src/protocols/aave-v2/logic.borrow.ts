import { InterestRateMode } from './types';
import { Service } from './service';
import { SpenderAaveV2Delegation__factory } from './contracts';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { getContractAddress } from './config';
import invariant from 'tiny-invariant';

export type BorrowLogicFields = core.TokenOutFields<{ interestRateMode: InterestRateMode }>;

@core.LogicDefinitionDecorator()
export class BorrowLogic extends core.Logic implements core.LogicTokenListInterface {
  static readonly supportedChainIds = [common.ChainId.mainnet, common.ChainId.polygon, common.ChainId.avalanche];

  async getTokenList() {
    const service = new Service(this.chainId, this.provider);
    const tokens = await service.getAssets();

    return tokens;
  }

  async getLogic(fields: BorrowLogicFields) {
    const { output, interestRateMode } = fields;
    invariant(!output.token.isNative, 'tokenOut should not be native token');

    const to = getContractAddress(this.chainId, 'SpenderAaveV2Delegation');
    const data = SpenderAaveV2Delegation__factory.createInterface().encodeFunctionData('borrow', [
      output.token.address,
      output.amountWei,
      interestRateMode,
    ]);

    return core.newLogic({ to, data });
  }
}

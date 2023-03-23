import { COMP } from './tokens';
import { CometRewards__factory } from './contracts';
import { Service } from './service';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { getContractAddress, getMarket } from './config';

export type ClaimLogicParams = core.ClaimParams<{ marketId: string }>;

export type ClaimLogicFields = core.ClaimFields<{ marketId: string }>;

@core.LogicDefinitionDecorator()
export class ClaimLogic extends core.Logic implements core.LogicTokenListInterface, core.LogicOracleInterface {
  static readonly supportedChainIds = [common.ChainId.mainnet, common.ChainId.polygon];

  async getTokenList() {
    return [COMP(this.chainId)];
  }

  async quote(params: ClaimLogicParams) {
    const { marketId, owner } = params;

    const service = new Service(this.chainId, this.provider);
    const output = await service.getRewardOwed(marketId, owner);

    return { marketId, owner, output };
  }

  async getLogic(fields: ClaimLogicFields) {
    const { marketId, owner } = fields;

    const market = getMarket(this.chainId, marketId);

    const to = getContractAddress(this.chainId, 'CometRewards');
    const data = CometRewards__factory.createInterface().encodeFunctionData('claim', [
      market.cometAddress,
      owner,
      true,
    ]);

    return core.newLogic({ to, data });
  }
}

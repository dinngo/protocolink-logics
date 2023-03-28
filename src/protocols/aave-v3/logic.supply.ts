import { BigNumberish } from 'ethers';
import { Pool__factory } from './contracts';
import { Service } from './service';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import invariant from 'tiny-invariant';

export type SupplyLogicParams = core.TokenToTokenExactInParams;

export type SupplyLogicFields = core.TokenToTokenExactInFields<{ referralCode?: number }>;

export type SupplyLogicOptions = Pick<core.GlobalOptions, 'account'>;

@core.LogicDefinitionDecorator()
export class SupplyLogic extends core.Logic implements core.LogicTokenListInterface, core.LogicOracleInterface {
  static readonly supportedChainIds = [common.ChainId.mainnet, common.ChainId.polygon, common.ChainId.avalanche];

  async getTokenList() {
    const service = new Service(this.chainId, this.provider);
    const reserveTokens = await service.getReserveTokens();

    return reserveTokens.map((reserveToken) => [reserveToken.asset, reserveToken.aToken]);
  }

  async quote(params: SupplyLogicParams) {
    const { input, tokenOut } = params;
    invariant(!input.token.isNative, 'tokenIn should not be native token');
    const output = new common.TokenAmount(tokenOut, input.amount);

    return { input, output };
  }

  async getLogic(fields: SupplyLogicFields, options: SupplyLogicOptions) {
    const { input, amountBps, referralCode = 0 } = fields;
    invariant(!input.token.isNative, 'tokenIn should not be native token');
    const { account } = options;

    const service = new Service(this.chainId, this.provider);
    const to = await service.getPoolAddress();
    const data = Pool__factory.createInterface().encodeFunctionData('supply', [
      input.token.address,
      input.amountWei,
      core.calcAccountAgent(this.chainId, account),
      referralCode,
    ]);
    let amountOffset: BigNumberish | undefined;
    if (amountBps) amountOffset = common.getParamOffset(1);
    const inputs = [core.newLogicInput({ input, amountBps, amountOffset })];

    return core.newLogic({ to, data, inputs });
  }
}

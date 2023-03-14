import { BigNumberish } from 'ethers';
import { LendingPool__factory } from './contracts';
import { Service } from './service';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import invariant from 'tiny-invariant';

export type DepositLogicParams = core.TokenToTokenExactInParams;

export type DepositLogicFields = core.TokenToTokenFields<{ referralCode?: number }>;

export type DepositLogicOptions = Pick<core.GlobalOptions, 'account'>;

@core.LogicDefinitionDecorator()
export class DepositLogic
  extends core.Logic
  implements core.LogicInterfaceGetSupportedTokens, core.LogicInterfaceGetPrice
{
  static readonly supportedChainIds = [common.ChainId.mainnet, common.ChainId.polygon, common.ChainId.avalanche];

  async getSupportedTokens() {
    const service = new Service(this.chainId, this.provider);
    const reserveTokens = await service.getReserveTokens();

    return reserveTokens.map((reserveToken) => [reserveToken.asset, reserveToken.aToken]);
  }

  async getPrice(params: DepositLogicParams) {
    const { input, tokenOut } = params;
    invariant(!input.token.isNative(), 'tokenIn should not be native token');
    const output = new common.TokenAmount(tokenOut, input.amount);

    return output;
  }

  async getLogic(fields: DepositLogicFields, options: DepositLogicOptions) {
    const { input, amountBps, referralCode = 0 } = fields;
    invariant(!input.token.isNative(), 'tokenIn should not be native token');
    const { account } = options;

    const service = new Service(this.chainId, this.provider);
    const to = await service.getLendingPoolAddress();
    const data = LendingPool__factory.createInterface().encodeFunctionData('deposit', [
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

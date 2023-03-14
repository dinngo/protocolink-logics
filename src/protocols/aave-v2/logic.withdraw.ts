import { BigNumberish } from 'ethers';
import { LendingPool__factory } from './contracts';
import { Service } from './service';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import invariant from 'tiny-invariant';

export type WithdrawLogicParams = core.TokenToTokenExactInParams;

export type WithdrawLogicFields = core.TokenToTokenFields;

export type WithdrawLogicOptions = Pick<core.GlobalOptions, 'account'>;

@core.LogicDefinitionDecorator()
export class WithdrawLogic
  extends core.Logic
  implements core.LogicInterfaceGetSupportedTokens, core.LogicInterfaceGetPrice
{
  static readonly supportedChainIds = [common.ChainId.mainnet, common.ChainId.polygon, common.ChainId.avalanche];

  async getSupportedTokens() {
    const service = new Service(this.chainId, this.provider);
    const reserveTokens = await service.getReserveTokens();

    return reserveTokens.map((reserveToken) => [reserveToken.aToken, reserveToken.asset]);
  }

  async getPrice(params: WithdrawLogicParams) {
    const { input, tokenOut } = params;
    invariant(!tokenOut.isNative(), 'tokenOut should not be native token');
    const output = new common.TokenAmount(tokenOut, input.amount);

    return output;
  }

  async getLogic(fields: WithdrawLogicFields, options: WithdrawLogicOptions) {
    const { input, output, amountBps } = fields;
    invariant(!output.token.isNative(), 'tokenOut should not be native token');
    const { account } = options;

    const service = new Service(this.chainId, this.provider);
    const to = await service.getLendingPoolAddress();
    const data = LendingPool__factory.createInterface().encodeFunctionData('withdraw', [
      output.token.address,
      input.amountWei,
      core.calcAccountAgent(this.chainId, account),
    ]);
    let amountOffset: BigNumberish | undefined;
    if (amountBps) amountOffset = common.getParamOffset(1);
    const inputs = [core.newLogicInput({ input, amountBps, amountOffset })];

    return core.newLogic({ to, data, inputs });
  }
}

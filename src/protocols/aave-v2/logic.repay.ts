import { BigNumberish } from 'ethers';
import { InterestRateMode } from './types';
import { LendingPool__factory } from './contracts';
import { Service } from './service';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import invariant from 'tiny-invariant';

export type RepayLogicFields = core.TokenInFields<{ interestRateMode: InterestRateMode; address: string }>;

@core.LogicDefinitionDecorator()
export class RepayLogic extends core.Logic implements core.LogicInterfaceGetSupportedTokens {
  static readonly supportedChainIds = [common.ChainId.mainnet, common.ChainId.polygon, common.ChainId.avalanche];

  async getSupportedTokens() {
    const service = new Service(this.chainId, this.provider);
    const tokens = await service.getAssets();

    return tokens;
  }

  async getDebt(user: string, asset: common.Token, interestRateMode: InterestRateMode) {
    const service = new Service(this.chainId, this.provider);
    const { currentStableDebt, currentVariableDebt } = await service.protocolDataProvider.getUserReserveData(
      asset.address,
      user
    );
    const currentDebt = interestRateMode === InterestRateMode.variable ? currentVariableDebt : currentStableDebt;
    const amountWei = common.calcSlippage(currentDebt, -100); // slightly higher than the current borrowed amount
    const debt = new common.TokenAmount(asset).setWei(amountWei);

    return debt;
  }

  async getLogic(fields: RepayLogicFields) {
    const { input, interestRateMode, address, amountBps } = fields;
    invariant(!input.token.isNative(), 'tokenIn should not be native token');

    const service = new Service(this.chainId, this.provider);
    const to = await service.getLendingPoolAddress();
    const data = LendingPool__factory.createInterface().encodeFunctionData('repay', [
      input.token.address,
      input.amountWei,
      interestRateMode,
      address,
    ]);
    let amountOffset: BigNumberish | undefined;
    if (amountBps) amountOffset = common.getParamOffset(1);
    const inputs = [core.newLogicInput({ input, amountBps, amountOffset })];

    return core.newLogic({ to, data, inputs });
  }
}

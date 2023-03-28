import { BigNumberish } from 'ethers';
import { InterestRateMode } from './types';
import { Pool__factory } from './contracts';
import { Service } from './service';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import invariant from 'tiny-invariant';

export type RepayLogicParams = core.RepayParams<{ interestRateMode: InterestRateMode }>;

export type RepayLogicFields = core.RepayFields<{ interestRateMode: InterestRateMode }>;

@core.LogicDefinitionDecorator()
export class RepayLogic extends core.Logic implements core.LogicTokenListInterface, core.LogicOracleInterface {
  static readonly supportedChainIds = [common.ChainId.mainnet, common.ChainId.polygon, common.ChainId.avalanche];

  async getTokenList() {
    const service = new Service(this.chainId, this.provider);
    const tokens = await service.getAssets();

    return tokens;
  }

  async quote(params: RepayLogicParams) {
    const { borrower, tokenIn, interestRateMode } = params;

    const service = new Service(this.chainId, this.provider);
    const { currentStableDebt, currentVariableDebt } = await service.poolDataProvider.getUserReserveData(
      tokenIn.address,
      borrower
    );
    const currentDebt = interestRateMode === InterestRateMode.variable ? currentVariableDebt : currentStableDebt;
    const amountWei = common.calcSlippage(currentDebt, -100); // slightly higher than the current borrowed amount
    const input = new common.TokenAmount(tokenIn).setWei(amountWei);

    return { borrower, interestRateMode, input };
  }

  async getLogic(fields: RepayLogicFields) {
    const { input, interestRateMode, borrower, amountBps } = fields;
    invariant(!input.token.isNative, 'tokenIn should not be native token');

    const service = new Service(this.chainId, this.provider);
    const to = await service.getPoolAddress();
    const data = Pool__factory.createInterface().encodeFunctionData('repay', [
      input.token.address,
      input.amountWei,
      interestRateMode,
      borrower,
    ]);
    let amountOffset: BigNumberish | undefined;
    if (amountBps) amountOffset = common.getParamOffset(1);
    const inputs = [core.newLogicInput({ input, amountBps, amountOffset })];

    return core.newLogic({ to, data, inputs });
  }
}

import { InterestRateMode } from './types';
import { LendingPool__factory } from './contracts';
import { Service } from './service';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';

export type RepayLogicParams = core.RepayParams<{ interestRateMode: InterestRateMode }>;

export type RepayLogicFields = core.RepayFields<{ interestRateMode: InterestRateMode }>;

@core.LogicDefinitionDecorator()
export class RepayLogic extends core.Logic implements core.LogicTokenListInterface, core.LogicOracleInterface {
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

  async quote(params: RepayLogicParams) {
    const { borrower, tokenIn, interestRateMode } = params;

    const service = new Service(this.chainId, this.provider);
    const { currentStableDebt, currentVariableDebt } = await service.protocolDataProvider.getUserReserveData(
      tokenIn.wrapped.address,
      borrower
    );
    const currentDebt = interestRateMode === InterestRateMode.variable ? currentVariableDebt : currentStableDebt;
    const amountWei = common.calcSlippage(currentDebt, -100); // slightly higher than the current borrowed amount
    const input = new common.TokenAmount(tokenIn).setWei(amountWei);

    return { borrower, interestRateMode, input };
  }

  async build(fields: RepayLogicFields) {
    const { input, interestRateMode, borrower, amountBps } = fields;

    const tokenIn = input.token.wrapped;

    const service = new Service(this.chainId, this.provider);
    const to = await service.getLendingPoolAddress();
    const data = LendingPool__factory.createInterface().encodeFunctionData('repay', [
      tokenIn.address,
      input.amountWei,
      interestRateMode,
      borrower,
    ]);
    const amountOffset = amountBps ? common.getParamOffset(1) : undefined;
    const inputs = [
      core.newLogicInput({ input: new common.TokenAmount(tokenIn, input.amount), amountBps, amountOffset }),
    ];
    const wrapMode = input.token.isNative ? core.WrapMode.wrapBefore : core.WrapMode.none;

    return core.newLogic({ to, data, inputs, wrapMode });
  }
}

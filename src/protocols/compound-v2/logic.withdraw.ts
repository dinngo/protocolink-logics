import { BigNumber } from 'ethers';
import { CErc20__factory } from './contracts';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { tokenPairs } from './tokens';

export type WithdrawLogicParams = core.TokenToTokenExactInParams;

export type WithdrawLogicFields = core.TokenToTokenExactInFields;

@core.LogicDefinitionDecorator()
export class WithdrawLogic extends core.Logic implements core.LogicTokenListInterface, core.LogicOracleInterface {
  static readonly supportedChainIds = [common.ChainId.mainnet];

  getTokenList() {
    return tokenPairs.map((tokenPair) => [tokenPair.cToken, tokenPair.underlyingToken]);
  }

  async quote(params: WithdrawLogicParams) {
    const { input, tokenOut } = params;

    const cToken = CErc20__factory.connect(input.token.address, this.provider);
    const exchangeRateCurrent = await cToken.callStatic.exchangeRateCurrent();
    const amountOutWei = input.amountWei.mul(exchangeRateCurrent).div(BigNumber.from(10).pow(18));
    const output = new common.TokenAmount(tokenOut).setWei(amountOutWei);

    return { input, output };
  }

  async getLogic(fields: WithdrawLogicFields) {
    const { input, amountBps } = fields;

    const to = input.token.address;
    const data = CErc20__factory.createInterface().encodeFunctionData('redeem', [input.amountWei]);
    const amountOffset = amountBps ? common.getParamOffset(0) : undefined;
    const inputs = [core.newLogicInput({ input, amountBps, amountOffset })];

    return core.newLogic({ to, data, inputs });
  }
}

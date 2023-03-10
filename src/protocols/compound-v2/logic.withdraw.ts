import { BigNumber, BigNumberish } from 'ethers';
import { CErc20__factory } from './contracts';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { tokenPairs } from './tokens';

export type WithdrawLogicParams = core.TokenToTokenExactInParams;

export type WithdrawLogicFields = core.TokenToTokenFields;

@core.LogicDefinitionDecorator()
export class WithdrawLogic
  extends core.Logic
  implements core.LogicInterfaceGetSupportedTokens, core.LogicInterfaceGetPrice
{
  static readonly supportedChainIds = [common.ChainId.mainnet];

  getSupportedTokens() {
    return tokenPairs.map((tokenPair) => [tokenPair.cToken, tokenPair.underlyingToken]);
  }

  async getPrice(params: WithdrawLogicParams) {
    const { input, tokenOut } = params;

    const cToken = CErc20__factory.connect(input.token.address, this.provider);
    const exchangeRateCurrent = await cToken.callStatic.exchangeRateCurrent();
    const amountOutWei = input.amountWei.mul(exchangeRateCurrent).div(BigNumber.from(10).pow(18));
    const output = new common.TokenAmount(tokenOut).setWei(amountOutWei);

    return output;
  }

  async getLogic(fields: WithdrawLogicFields) {
    const { input, amountBps } = fields;

    const to = input.token.address;
    const data = CErc20__factory.createInterface().encodeFunctionData('redeem', [input.amountWei]);
    let amountOffset: BigNumberish | undefined;
    if (amountBps) amountOffset = common.getParamOffset(0);
    const inputs = [core.newLogicInput({ input, amountBps, amountOffset })];

    return core.newLogic({ to, data, inputs });
  }
}

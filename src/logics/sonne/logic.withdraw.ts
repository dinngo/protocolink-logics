import { BigNumber } from 'ethers';
import { CErc20Immutable__factory } from './contracts';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { supportedChainIds, tokenPairs } from './configs';

export type WithdrawLogicTokenList = [common.Token, common.Token][];

export type WithdrawLogicParams = core.TokenToTokenExactInParams;

export type WithdrawLogicFields = core.TokenToTokenExactInFields;

export class WithdrawLogic
  extends core.Logic
  implements core.LogicTokenListInterface, core.LogicOracleInterface, core.LogicBuilderInterface
{
  static id = 'withdraw';
  static protocolId = 'sonne';
  static readonly supportedChainIds = supportedChainIds;

  getTokenList() {
    const tokenList: WithdrawLogicTokenList = tokenPairs[this.chainId].map(({ underlyingToken, cToken }) => [
      cToken,
      underlyingToken,
    ]);

    return tokenList;
  }

  async quote(params: WithdrawLogicParams) {
    const { input, tokenOut } = params;

    const exchangeRateCurrent = await CErc20Immutable__factory.connect(
      input.token.address,
      this.provider
    ).callStatic.exchangeRateCurrent();
    const amountOutWei = input.amountWei.mul(exchangeRateCurrent).div(BigNumber.from(10).pow(18));
    const output = new common.TokenAmount(tokenOut).setWei(amountOutWei);

    return { input, output };
  }

  async build(fields: WithdrawLogicFields) {
    const { input, balanceBps } = fields;

    const to = input.token.address;
    const data = CErc20Immutable__factory.createInterface().encodeFunctionData('redeem', [input.amountWei]);
    const amountOffset = balanceBps ? common.getParamOffset(0) : undefined;
    const inputs = [core.newLogicInput({ input, balanceBps, amountOffset })];

    return core.newLogic({ to, data, inputs });
  }
}

import { BigNumberish, constants, utils } from 'ethers';
import { Comet__factory } from './contracts';
import { Service } from './service';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { encodeWithdrawNativeTokenAction } from './utils';
import { getMarket, getMarkets } from './config';

export type WithdrawBaseLogicParams = core.TokenToTokenExactInParams<{ marketId: string }>;

export type WithdrawBaseLogicFields = core.TokenToTokenExactInFields<{ marketId: string }>;

export type WithdrawBaseLogicOptions = Pick<core.GlobalOptions, 'account'>;

@core.LogicDefinitionDecorator()
export class WithdrawBaseLogic extends core.Logic implements core.LogicTokenListInterface, core.LogicOracleInterface {
  static readonly supportedChainIds = [common.ChainId.mainnet, common.ChainId.polygon];

  async getTokenList() {
    const tokenList: Record<string, [common.Token, common.Token]> = {};

    const markets = getMarkets(this.chainId);
    const service = new Service(this.chainId, this.provider);
    for (const market of markets) {
      const { cToken, baseToken } = await service.getCometTokens(market.id);
      tokenList[market.id] = [cToken, baseToken.unwrapped];
    }

    return tokenList;
  }

  async quote(params: WithdrawBaseLogicParams) {
    const { input, tokenOut } = params;

    const output = new common.TokenAmount(tokenOut, input.amount);

    return { input, output };
  }

  async getLogic(fields: WithdrawBaseLogicFields, options: WithdrawBaseLogicOptions) {
    const { marketId, input, output, amountBps } = fields;

    const market = getMarket(this.chainId, marketId);
    const amountWei = amountBps ? input.amountWei : constants.MaxUint256;

    let to: string;
    let data: string;
    let amountOffset: BigNumberish | undefined;
    if (output.token.isNative) {
      const userAgent = core.calcAccountAgent(this.chainId, options.account);

      to = market.bulker.address;
      data = new utils.Interface(market.bulker.abi).encodeFunctionData('invoke', [
        [market.bulker.actions.withdrawNativeToken],
        [encodeWithdrawNativeTokenAction(market.cometAddress, userAgent, amountWei)],
      ]);
      if (amountBps) amountOffset = common.getParamOffset(9);
    } else {
      to = market.cometAddress;
      data = Comet__factory.createInterface().encodeFunctionData('withdraw', [output.token.address, amountWei]);
      if (amountBps) amountOffset = common.getParamOffset(1);
    }
    const inputs = [core.newLogicInput({ input, amountBps, amountOffset })];

    return core.newLogic({ to, data, inputs });
  }
}

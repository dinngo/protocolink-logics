import { BigNumberish, constants, utils } from 'ethers';
import { Comet__factory } from './contracts';
import { Service } from './service';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { encodeSupplyNativeTokenAction } from './utils';
import { getMarket, getMarkets } from './config';

export type SupplyBaseLogicParams = core.TokenToTokenExactInParams<{ marketId: string }>;

export type SupplyBaseLogicFields = core.TokenToTokenExactInFields<{ marketId: string }>;

export type SupplyBaseLogicOptions = Pick<core.GlobalOptions, 'account'>;

@core.LogicDefinitionDecorator()
export class SupplyBaseLogic extends core.Logic implements core.LogicTokenListInterface, core.LogicOracleInterface {
  static readonly supportedChainIds = [common.ChainId.mainnet, common.ChainId.polygon];

  async getTokenList() {
    const tokenList: Record<string, [common.Token, common.Token]> = {};

    const markets = getMarkets(this.chainId);
    const service = new Service(this.chainId, this.provider);
    for (const market of markets) {
      const { cToken, baseToken } = await service.getCometTokens(market.id);
      tokenList[market.id] = [baseToken.unwrapped, cToken];
    }

    return tokenList;
  }

  async quote(params: SupplyBaseLogicParams) {
    const { marketId, input, tokenOut } = params;

    const output = new common.TokenAmount(tokenOut, input.amount);

    return { marketId, input, output };
  }

  async getLogic(fields: SupplyBaseLogicFields, options: SupplyBaseLogicOptions) {
    const { marketId, input, amountBps } = fields;

    const market = getMarket(this.chainId, marketId);

    let to: string;
    let data: string;
    let amountOffset: BigNumberish | undefined;
    if (input.token.isNative) {
      const userAgent = core.calcAccountAgent(this.chainId, options.account);

      to = market.bulker.address;
      data = new utils.Interface(market.bulker.abi).encodeFunctionData('invoke', [
        [market.bulker.actions.supplyNativeToken],
        [encodeSupplyNativeTokenAction(market.cometAddress, userAgent, input.amountWei)],
      ]);
      if (amountBps) amountOffset = constants.MaxUint256;
    } else {
      to = market.cometAddress;
      data = Comet__factory.createInterface().encodeFunctionData('supply', [input.token.address, input.amountWei]);
      if (amountBps) amountOffset = common.getParamOffset(1);
    }
    const inputs = [core.newLogicInput({ input, amountBps, amountOffset })];

    return core.newLogic({ to, data, inputs });
  }
}

import { Comet__factory } from './contracts';
import { Service } from './service';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { getMarket, getMarkets } from './config';

export type SupplyBaseLogicParams = core.TokenToTokenExactInParams<{ marketId: string }>;

export type SupplyBaseLogicFields = core.TokenToTokenExactInFields<{ marketId: string }>;

@core.LogicDefinitionDecorator()
export class SupplyBaseLogic extends core.Logic implements core.LogicTokenListInterface, core.LogicOracleInterface {
  static readonly supportedChainIds = [common.ChainId.mainnet, common.ChainId.polygon];

  async getTokenList() {
    const tokenList: Record<string, [common.Token, common.Token][]> = {};

    const markets = getMarkets(this.chainId);
    const service = new Service(this.chainId, this.provider);
    for (const market of markets) {
      const { cToken, baseToken } = await service.getCometTokens(market.id);
      tokenList[market.id] = [];
      if (baseToken.isWrapped) {
        tokenList[market.id].push([baseToken.unwrapped, cToken]);
      }
      tokenList[market.id].push([baseToken, cToken]);
    }

    return tokenList;
  }

  async quote(params: SupplyBaseLogicParams) {
    const { marketId, input, tokenOut } = params;
    const output = new common.TokenAmount(tokenOut, input.amount);

    return { marketId, input, output };
  }

  async build(fields: SupplyBaseLogicFields) {
    const { marketId, input, amountBps } = fields;

    const market = getMarket(this.chainId, marketId);
    const tokenIn = input.token.wrapped;

    const to = market.cometAddress;
    const data = Comet__factory.createInterface().encodeFunctionData('supply', [tokenIn.address, input.amountWei]);
    const amountOffset = amountBps ? common.getParamOffset(1) : undefined;
    const inputs = [
      core.newLogicInput({ input: new common.TokenAmount(tokenIn, input.amount), amountBps, amountOffset }),
    ];
    const wrapMode = input.token.isNative ? core.WrapMode.wrapBefore : core.WrapMode.none;

    return core.newLogic({ to, data, inputs, wrapMode });
  }
}

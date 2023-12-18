import { Comet__factory } from './contracts';
import { Service } from './service';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { getMarket, getMarkets, supportedChainIds } from './configs';

export type SupplyBaseLogicTokenList = Record<string, [common.Token, common.Token][]>;

export type SupplyBaseLogicParams = core.TokenToTokenExactInParams<{ marketId: string }>;

export type SupplyBaseLogicFields = core.TokenToTokenExactInFields<{ marketId: string }>;

export class SupplyBaseLogic
  extends core.Logic
  implements core.LogicTokenListInterface, core.LogicOracleInterface, core.LogicBuilderInterface
{
  static id = 'supply-base';
  static protocolId = 'compound-v3';
  static readonly supportedChainIds = supportedChainIds;

  async getTokenList() {
    const tokenList: SupplyBaseLogicTokenList = {};

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
    const { marketId, input, balanceBps } = fields;

    const market = getMarket(this.chainId, marketId);
    const tokenIn = input.token.wrapped;

    const to = market.cometAddress;
    const data = Comet__factory.createInterface().encodeFunctionData('supply', [tokenIn.address, input.amountWei]);
    const amountOffset = balanceBps ? common.getParamOffset(1) : undefined;
    const inputs = [
      core.newLogicInput({ input: new common.TokenAmount(tokenIn, input.amount), balanceBps, amountOffset }),
    ];
    const wrapMode = input.token.isNative ? core.WrapMode.wrapBefore : core.WrapMode.none;

    return core.newLogic({ to, data, inputs, wrapMode });
  }
}

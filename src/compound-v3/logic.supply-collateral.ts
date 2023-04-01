import { Comet__factory } from './contracts';
import { Service } from './service';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { getMarket, getMarkets } from './config';

export type SupplyCollateralLogicFields = core.TokenInFields<{ marketId: string }>;

export type SupplyCollateralLogicOptions = Pick<core.GlobalOptions, 'account'>;

@core.LogicDefinitionDecorator()
export class SupplyCollateralLogic extends core.Logic implements core.LogicTokenListInterface {
  static readonly supportedChainIds = [common.ChainId.mainnet, common.ChainId.polygon];

  async getTokenList() {
    const tokenList: Record<string, common.Token[]> = {};

    const service = new Service(this.chainId, this.provider);
    const markets = getMarkets(this.chainId);
    for (const market of markets) {
      const collaterals = await service.getCollaterals(market.id);
      tokenList[market.id] = collaterals;
    }

    return tokenList;
  }

  async build(fields: SupplyCollateralLogicFields, options: SupplyCollateralLogicOptions) {
    const { marketId, input, amountBps } = fields;
    const { account } = options;

    const market = getMarket(this.chainId, marketId);
    const tokenIn = input.token.wrapped;

    const to = market.cometAddress;
    const data = Comet__factory.createInterface().encodeFunctionData('supplyTo', [
      account,
      tokenIn.address,
      input.amountWei,
    ]);
    const amountOffset = amountBps ? common.getParamOffset(2) : undefined;
    const inputs = [
      core.newLogicInput({ input: new common.TokenAmount(tokenIn, input.amount), amountBps, amountOffset }),
    ];
    const wrapMode = input.token.isNative ? core.WrapMode.wrapBefore : core.WrapMode.none;

    return core.newLogic({ to, data, inputs, wrapMode });
  }
}

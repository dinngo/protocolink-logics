import { Comet__factory } from './contracts';
import { Service } from './service';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { getMarket, getMarkets, supportedChainIds } from './configs';

export type SupplyCollateralLogicTokenList = Record<string, common.Token[]>;

export type SupplyCollateralLogicFields = core.TokenInFields<{ marketId: string }>;

export type SupplyCollateralLogicOptions = Pick<core.GlobalOptions, 'account'>;

@core.LogicDefinitionDecorator()
export class SupplyCollateralLogic
  extends core.Logic
  implements core.LogicTokenListInterface, core.LogicBuilderInterface
{
  static readonly supportedChainIds = supportedChainIds;

  async getTokenList() {
    const tokenList: SupplyCollateralLogicTokenList = {};

    const service = new Service(this.chainId, this.provider);
    const markets = getMarkets(this.chainId);
    for (const market of markets) {
      const collaterals = await service.getCollaterals(market.id);
      tokenList[market.id] = collaterals;
    }

    return tokenList;
  }

  async build(fields: SupplyCollateralLogicFields, options: SupplyCollateralLogicOptions) {
    const { marketId, input, balanceBps } = fields;
    const { account } = options;

    const market = getMarket(this.chainId, marketId);
    const tokenIn = input.token.wrapped;

    const to = market.cometAddress;
    const data = Comet__factory.createInterface().encodeFunctionData('supplyTo', [
      account,
      tokenIn.address,
      input.amountWei,
    ]);
    const amountOffset = balanceBps ? common.getParamOffset(2) : undefined;
    const inputs = [
      core.newLogicInput({ input: new common.TokenAmount(tokenIn, input.amount), balanceBps, amountOffset }),
    ];
    const wrapMode = input.token.isNative ? core.WrapMode.wrapBefore : core.WrapMode.none;

    return core.newLogic({ to, data, inputs, wrapMode });
  }
}

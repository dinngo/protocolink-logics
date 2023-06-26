import { Comet__factory } from './contracts';
import { Service } from './service';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { getMarket, getMarkets } from './config';

export type WithdrawCollateralLogicTokenList = Record<string, common.Token[]>;

export type WithdrawCollateralLogicFields = core.TokenOutFields<{ marketId: string }>;

export type WithdrawCollateralLogicOptions = Pick<core.GlobalOptions, 'account'>;

@core.LogicDefinitionDecorator()
export class WithdrawCollateralLogic
  extends core.Logic
  implements core.LogicTokenListInterface, core.LogicBuilderInterface
{
  static readonly supportedChainIds = [common.ChainId.mainnet, common.ChainId.polygon];

  async getTokenList() {
    const tokenList: WithdrawCollateralLogicTokenList = {};

    const service = new Service(this.chainId, this.provider);
    const markets = getMarkets(this.chainId);
    for (const market of markets) {
      const collaterals = await service.getCollaterals(market.id);
      tokenList[market.id] = collaterals.map((collateral) => collateral.wrapped);
    }

    return tokenList;
  }

  async build(fields: WithdrawCollateralLogicFields, options: WithdrawCollateralLogicOptions) {
    const { marketId, output } = fields;
    const { account } = options;

    const market = getMarket(this.chainId, marketId);
    const userAgent = core.calcAccountAgent(this.chainId, account);
    const tokenOut = output.token.wrapped;

    const to = market.cometAddress;
    const data = Comet__factory.createInterface().encodeFunctionData('withdrawFrom', [
      account,
      userAgent,
      tokenOut.address,
      output.amountWei,
    ]);
    const wrapMode = output.token.isNative ? core.WrapMode.unwrapAfter : core.WrapMode.none;

    return core.newLogic({ to, data, wrapMode });
  }
}

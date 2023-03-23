import { Comet__factory } from './contracts';
import { Service } from './service';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { getMarket, getMarkets } from './config';

export type BorrowLogicFields = core.TokenOutFields<{ marketId: string }>;

export type BorrowLogicOptions = Pick<core.GlobalOptions, 'account'>;

@core.LogicDefinitionDecorator()
export class BorrowLogic extends core.Logic implements core.LogicTokenListInterface {
  static readonly supportedChainIds = [common.ChainId.mainnet, common.ChainId.polygon];

  async getTokenList() {
    const tokenList: Record<string, common.Token> = {};

    const markets = getMarkets(this.chainId);
    const service = new Service(this.chainId, this.provider);
    for (const market of markets) {
      const baseToken = await service.getBaseToken(market.id);
      tokenList[market.id] = baseToken;
    }

    return tokenList;
  }

  async getLogic(fields: BorrowLogicFields, options: BorrowLogicOptions) {
    const { marketId, output } = fields;
    const { account } = options;

    const market = getMarket(this.chainId, marketId);
    const userAgent = core.calcAccountAgent(this.chainId, account);

    const to = market.cometAddress;
    const data = Comet__factory.createInterface().encodeFunctionData('withdrawFrom', [
      account,
      userAgent,
      output.token.address,
      output.amountWei,
    ]);

    return core.newLogic({ to, data });
  }
}

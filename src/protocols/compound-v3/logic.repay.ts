import { Comet__factory } from './contracts';
import { Service } from './service';
import * as common from '@composable-router/common';
import { constants } from 'ethers';
import * as core from '@composable-router/core';
import { getMarket, getMarkets } from './config';

export type RepayLogicFields = Omit<core.TokenInFields<{ marketId: string; repayAll?: boolean }>, 'amountBps'>;

export type RepayLogicOptions = Pick<core.GlobalOptions, 'account'>;

@core.LogicDefinitionDecorator()
export class RepayLogic extends core.Logic implements core.LogicTokenListInterface {
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

  async getLogic(fields: RepayLogicFields, options: RepayLogicOptions) {
    const { marketId, input, repayAll } = fields;
    const { account } = options;

    const market = getMarket(this.chainId, marketId);

    const to = market.cometAddress;
    const data = Comet__factory.createInterface().encodeFunctionData('supplyTo', [
      account,
      input.token.address,
      repayAll ? constants.MaxUint256 : input.amountWei,
    ]);
    const inputs = [core.newLogicInput({ input })];

    return core.newLogic({ to, data, inputs });
  }
}

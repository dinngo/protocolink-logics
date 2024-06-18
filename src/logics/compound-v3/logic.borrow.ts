import { Comet__factory } from './contracts';
import { Service } from './service';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { getMarket, getMarkets, supportedChainIds } from './configs';

export type BorrowLogicTokenList = Record<string, common.Token[]>;

export type BorrowLogicFields = core.TokenOutFields<{ marketId: string }>;

export type BorrowLogicOptions = Pick<core.GlobalOptions, 'account'>;

export class BorrowLogic extends core.Logic implements core.LogicTokenListInterface, core.LogicBuilderInterface {
  static id = 'borrow';
  static protocolId = 'compound-v3';
  static readonly supportedChainIds = supportedChainIds;

  async getTokenList() {
    const tokenList: BorrowLogicTokenList = {};

    const markets = getMarkets(this.chainId);
    const service = new Service(this.chainId, this.provider);
    for (const market of markets) {
      const baseToken = await service.getBaseToken(market.id);
      tokenList[market.id] = [];
      if (baseToken.isWrapped) {
        tokenList[market.id].push(baseToken.unwrapped);
      }
      tokenList[market.id].push(baseToken);
    }

    return tokenList;
  }

  async build(fields: BorrowLogicFields, options: BorrowLogicOptions) {
    const { marketId, output } = fields;
    const { account } = options;

    const market = getMarket(this.chainId, marketId);
    const tokenOut = output.token.wrapped;
    const agent = await this.calcAgent(account);

    const to = market.comet.address;
    const data = Comet__factory.createInterface().encodeFunctionData('withdrawFrom', [
      account,
      agent,
      tokenOut.address,
      output.amountWei,
    ]);
    const wrapMode = output.token.isNative ? core.WrapMode.unwrapAfter : core.WrapMode.none;

    return core.newLogic({ to, data, wrapMode });
  }
}

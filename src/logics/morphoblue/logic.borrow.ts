import { Service } from './service';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { getMarket, getMarkets, supportedChainIds } from './configs';

export type BorrowLogicTokenList = Record<string, common.Token[]>;

export type BorrowLogicFields = core.TokenOutFields<{ marketId: string }>;

export type BorrowLogicOptions = Pick<core.GlobalOptions, 'account'>;

export class BorrowLogic extends core.Logic implements core.LogicTokenListInterface, core.LogicBuilderInterface {
  static id = 'borrow';
  static protocolId = 'morphoblue';
  static readonly supportedChainIds = supportedChainIds;

  async getTokenList() {
    const tokenList: BorrowLogicTokenList = {};
    const service = new Service(this.chainId, this.provider);

    // TODO: get all the markets vs whitelisted markets
    const markets = getMarkets(this.chainId);

    for (const market of markets) {
      const loanTokens = await service.getLoanTokens(market.id);
      for (const loanToken of loanTokens!) {
        tokenList[market.id] = [];
        if (loanToken.isWrapped) tokenList[market.id].push(loanToken.unwrapped);
        tokenList[market.id].push(loanToken);
      }
    }

    return tokenList;
  }

  async build(fields: BorrowLogicFields, options: BorrowLogicOptions) {
    const { marketId, output } = fields;
    const { account } = options;

    const { collateralTokenAddress, oracle, irm, lltv } = getMarket(this.chainId, marketId);
    const loanToken = output.token.wrapped;
    const agent = await this.calcAgent(account);

    const service = new Service(this.chainId, this.provider);
    const to = service.morpho.address;
    const data = service.morphoIface.encodeFunctionData('borrow', [
      { loanToken: loanToken.address, collateralToken: collateralTokenAddress, oracle, irm, lltv },
      output.amountWei, // assets
      0, // shares
      account, // onBehalf
      agent, // receiver
    ]);
    const wrapMode = output.token.isNative ? core.WrapMode.unwrapAfter : core.WrapMode.none;

    return core.newLogic({ to, data, wrapMode });
  }
}

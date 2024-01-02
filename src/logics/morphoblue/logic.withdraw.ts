import { Service } from './service';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { getMarket, getMarkets, supportedChainIds } from './configs';

export type WithdrawLogicTokenList = Record<string, common.Token[]>;

export type WithdrawLogicFields = core.TokenOutFields<{ marketId: string }>;

export type WithdrawLogicOptions = Pick<core.GlobalOptions, 'account'>;

export class WithdrawLogic extends core.Logic implements core.LogicTokenListInterface, core.LogicBuilderInterface {
  static id = 'withdraw';
  static protocolId = 'morphoblue';
  static readonly supportedChainIds = supportedChainIds;

  async getTokenList() {
    const tokenList: WithdrawLogicTokenList = {};
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

  async build(fields: WithdrawLogicFields, options: WithdrawLogicOptions) {
    const { marketId, output } = fields;
    const { account } = options;

    const { collateralTokenAddress, oracle, irm, lltv } = getMarket(this.chainId, marketId);
    const loanToken = output.token.wrapped;
    const agent = await this.calcAgent(account);

    const service = new Service(this.chainId, this.provider);
    const to = service.morpho.address;
    const data = service.morphoIface.encodeFunctionData('withdraw', [
      [loanToken.address, collateralTokenAddress, oracle, irm, lltv],
      output.amountWei, // assets
      0, // shares
      account, // onBehalf
      agent, // receiver
    ]);
    const wrapMode = output.token.isNative ? core.WrapMode.unwrapAfter : core.WrapMode.none;

    return core.newLogic({ to, data, wrapMode });
  }
}

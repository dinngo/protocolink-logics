import { Service } from './service';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { getMarket, getMarkets, supportedChainIds } from './configs';

export type WithdrawCollateralLogicTokenList = Record<string, common.Token[]>;

export type WithdrawCollateralLogicFields = core.TokenOutFields<{ marketId: string }>;

export type WithdrawCollateralLogicOptions = Pick<core.GlobalOptions, 'account'>;

export class WithdrawCollateralLogic
  extends core.Logic
  implements core.LogicTokenListInterface, core.LogicBuilderInterface
{
  static id = 'withdraw-collateral';
  static protocolId = 'morphoblue';
  static readonly supportedChainIds = supportedChainIds;

  async getTokenList() {
    const tokenList: WithdrawCollateralLogicTokenList = {};
    const service = new Service(this.chainId, this.provider);

    const markets = getMarkets(this.chainId);

    for (const market of markets) {
      const collateralTokens = await service.getCollateralTokens(market.id);
      for (const collateralToken of collateralTokens!) {
        tokenList[market.id] = [];
        if (collateralToken.isWrapped) tokenList[market.id].push(collateralToken.unwrapped);
        tokenList[market.id].push(collateralToken);
      }
    }

    return tokenList;
  }

  async build(fields: WithdrawCollateralLogicFields, options: WithdrawCollateralLogicOptions) {
    const { marketId, output } = fields;
    const { account } = options;

    const { loanTokenAddress, oracle, irm, lltv } = getMarket(this.chainId, marketId);
    const collateralToken = output.token.wrapped;
    const agent = await this.calcAgent(account);

    const service = new Service(this.chainId, this.provider);
    const to = service.morpho.address;
    const data = service.morphoIface.encodeFunctionData('withdrawCollateral', [
      { loanToken: loanTokenAddress, collateralToken: collateralToken.address, oracle, irm, lltv },
      output.amountWei, // assets
      account, // onBehalf
      agent, // receiver
    ]);
    const wrapMode = output.token.isNative ? core.WrapMode.unwrapAfter : core.WrapMode.none;

    return core.newLogic({ to, data, wrapMode });
  }
}

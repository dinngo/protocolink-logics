import { Service } from './service';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { getMarket, getMarkets, supportedChainIds } from './configs';

export type SupplyLogicTokenList = Record<string, common.Token[]>;

export type SupplyLogicFields = core.TokenInFields<{ marketId: string }>;

export type SupplyLogicOptions = Pick<core.GlobalOptions, 'account'>;

export class SupplyLogic extends core.Logic implements core.LogicTokenListInterface, core.LogicBuilderInterface {
  static id = 'supply';
  static protocolId = 'morphoblue';
  static readonly supportedChainIds = supportedChainIds;

  async getTokenList() {
    const tokenList: SupplyLogicTokenList = {};
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

  async build(fields: SupplyLogicFields, options: SupplyLogicOptions) {
    const { marketId, input, balanceBps } = fields;
    const { account } = options;

    const { collateralTokenAddress, oracle, irm, lltv } = getMarket(this.chainId, marketId);
    const loanToken = input.token.wrapped;

    const service = new Service(this.chainId, this.provider);
    const to = service.morpho.address;
    const data = service.morphoIface.encodeFunctionData('supply', [
      { loanToken: loanToken.address, collateralToken: collateralTokenAddress, oracle, irm, lltv },
      input.amountWei, // assets
      0, // shares
      account, // onBehalf
      '0x', // data
    ]);
    const amountOffset = balanceBps ? common.getParamOffset(5) : undefined;
    const inputs = [
      core.newLogicInput({ input: new common.TokenAmount(loanToken, input.amount), balanceBps, amountOffset }),
    ];
    const wrapMode = input.token.isNative ? core.WrapMode.wrapBefore : core.WrapMode.none;

    return core.newLogic({ to, data, inputs, wrapMode });
  }
}

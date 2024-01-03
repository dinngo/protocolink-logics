import { Service } from './service';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { getMarket, getMarkets, supportedChainIds } from './configs';

export type SupplyCollateralLogicTokenList = Record<string, common.Token[]>;

export type SupplyCollateralLogicFields = core.TokenInFields<{ marketId: string }>;

export type SupplyCollateralLogicOptions = Pick<core.GlobalOptions, 'account'>;

export class SupplyCollateralLogic
  extends core.Logic
  implements core.LogicTokenListInterface, core.LogicBuilderInterface
{
  static id = 'supply-collateral';
  static protocolId = 'morphoblue';
  static readonly supportedChainIds = supportedChainIds;

  async getTokenList() {
    const tokenList: SupplyCollateralLogicTokenList = {};
    const service = new Service(this.chainId, this.provider);

    // TODO: get all the markets vs whitelisted markets
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

  async build(fields: SupplyCollateralLogicFields, options: SupplyCollateralLogicOptions) {
    const { marketId, input, balanceBps } = fields;
    const { account } = options;

    const { loanTokenAddress, oracle, irm, lltv } = getMarket(this.chainId, marketId);
    const collateralToken = input.token.wrapped;

    const service = new Service(this.chainId, this.provider);
    const to = service.morpho.address;
    const data = service.morphoIface.encodeFunctionData('supplyCollateral', [
      { loanToken: loanTokenAddress, collateralToken: collateralToken.address, oracle, irm, lltv },
      input.amountWei, // assets
      account, // onBehalf
      '0x', // data
    ]);
    const amountOffset = balanceBps ? common.getParamOffset(5) : undefined;
    const inputs = [
      core.newLogicInput({ input: new common.TokenAmount(collateralToken, input.amount), balanceBps, amountOffset }),
    ];
    const wrapMode = input.token.isNative ? core.WrapMode.wrapBefore : core.WrapMode.none;

    return core.newLogic({ to, data, inputs, wrapMode });
  }
}

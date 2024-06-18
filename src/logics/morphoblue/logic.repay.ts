import { Service } from './service';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { getMarket, getMarkets, supportedChainIds } from './configs';

export type RepayLogicTokenList = Record<string, common.Token[]>;

export type RepayLogicParams = core.RepayParams<{ marketId: string }>;

export type RepayLogicFields = core.RepayFields<{ marketId: string }>;

export class RepayLogic extends core.Logic implements core.LogicTokenListInterface, core.LogicBuilderInterface {
  static id = 'repay';
  static protocolId = 'morphoblue';
  static readonly supportedChainIds = supportedChainIds;

  async getTokenList() {
    const tokenList: RepayLogicTokenList = {};
    const service = new Service(this.chainId, this.provider);

    const markets = getMarkets(this.chainId);

    for (const market of markets) {
      const loanToken = await service.getLoanToken(market.id);
      tokenList[market.id] = [];
      if (loanToken.isWrapped) tokenList[market.id].push(loanToken.unwrapped);
      tokenList[market.id].push(loanToken);
    }

    return tokenList;
  }

  async quote(params: RepayLogicParams) {
    const { marketId, borrower, tokenIn } = params;

    const service = new Service(this.chainId, this.provider);
    const borrowBalance = await service.getBorrowBalance(marketId, borrower, tokenIn);
    borrowBalance.setWei(common.calcSlippage(borrowBalance.amountWei, -1)); // slightly higher than borrowed amount

    return { marketId, borrower, input: borrowBalance };
  }

  async build(fields: RepayLogicFields) {
    const { marketId, borrower, input, balanceBps } = fields;

    const { collateralToken, oracle, irm, lltv } = getMarket(this.chainId, marketId);
    const loanToken = input.token.wrapped;

    const service = new Service(this.chainId, this.provider);
    const borrowShares = await service.getBorrowShares(marketId, borrower);
    const borrowBalance = await service.getBorrowBalance(marketId, borrower, input.token);
    const repayAll = input.gt(borrowBalance); // morpho accrues interests before repay
    const assets = repayAll ? 0 : input.amountWei;
    const shares = repayAll ? borrowShares : 0;

    const to = service.morpho.address;
    const data = service.morphoIface.encodeFunctionData('repay', [
      { loanToken: loanToken.address, collateralToken: collateralToken.address, oracle, irm, lltv },
      assets, // assets
      shares, // shares
      borrower, // onBehalf
      '0x', // data
    ]);

    const options: core.NewLogicInputOptions = { input: new common.TokenAmount(loanToken, input.amount) };
    if (balanceBps && !repayAll) {
      options.balanceBps = balanceBps;
      options.amountOffset = common.getParamOffset(5);
    }
    const inputs = [core.newLogicInput(options)];

    const wrapMode = input.token.isNative ? core.WrapMode.wrapBefore : core.WrapMode.none;

    return core.newLogic({ to, data, inputs, wrapMode });
  }
}

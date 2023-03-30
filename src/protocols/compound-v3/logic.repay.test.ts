import { Comet__factory } from './contracts';
import { LogicTestCase } from 'test/types';
import { MarketId, getMarket } from './config';
import { RepayLogic, RepayLogicFields } from './logic.repay';
import * as common from '@composable-router/common';
import { constants, utils } from 'ethers';
import * as core from '@composable-router/core';
import { expect } from 'chai';
import { mainnetTokens } from './tokens';

describe('CompoundV3 RepayLogic', function () {
  context('Test getTokenList', async function () {
    RepayLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.getNetworkId(chainId)}`, async function () {
        const compoundV3RepayLogic = new RepayLogic(chainId);
        const tokenList = await compoundV3RepayLogic.getTokenList();
        const marketIds = Object.keys(tokenList);
        expect(marketIds).to.have.lengthOf.above(0);
        for (const marketId of marketIds) {
          expect(tokenList[marketId]).to.have.lengthOf.above(0);
        }
      });
    });
  });

  context('Test getLogic', function () {
    const chainId = common.ChainId.mainnet;
    const compoundV3RepayLogic = new RepayLogic(chainId);
    const ifaceComet = Comet__factory.createInterface();
    const account = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';

    const testCases: LogicTestCase<RepayLogicFields>[] = [
      { fields: { marketId: MarketId.USDC, input: new common.TokenAmount(mainnetTokens.USDC, '1') } },
      { fields: { marketId: MarketId.ETH, input: new common.TokenAmount(mainnetTokens.ETH, '1') } },
      { fields: { marketId: MarketId.ETH, input: new common.TokenAmount(mainnetTokens.WETH, '1') } },
    ];

    testCases.forEach(({ fields }) => {
      it(`repay ${fields.input.token.symbol} to ${fields.marketId} market`, async function () {
        const routerLogic = await compoundV3RepayLogic.getLogic(fields, { account });
        const sig = routerLogic.data.substring(0, 10);
        const { marketId, input } = fields;
        const market = getMarket(chainId, marketId);

        expect(routerLogic.to).to.eq(market.cometAddress);
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        expect(sig).to.eq(ifaceComet.getSighash('supplyTo'));
        expect(routerLogic.inputs[0].token).to.eq(input.token.wrapped.address);
        expect(routerLogic.inputs[0].amountBps).to.eq(constants.MaxUint256);
        expect(routerLogic.inputs[0].amountOrOffset).to.eq(input.amountWei);
        expect(routerLogic.wrapMode).to.eq(input.token.isNative ? core.WrapMode.wrapBefore : core.WrapMode.none);
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

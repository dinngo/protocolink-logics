import { BorrowLogic, BorrowLogicFields } from './logic.borrow';
import { Comet__factory } from './contracts';
import { LogicTestCase } from 'test/types';
import { MarketId, getMarket } from './config';
import * as common from '@composable-router/common';
import { constants, utils } from 'ethers';
import * as core from '@composable-router/core';
import { expect } from 'chai';
import { mainnetTokens } from './tokens';

describe('CompoundV3 BorrowLogic', function () {
  context('Test getTokenList', async function () {
    BorrowLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.getNetworkId(chainId)}`, async function () {
        const compoundV3BorrowLogic = new BorrowLogic(chainId);
        const tokenList = await compoundV3BorrowLogic.getTokenList();
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
    const compoundV3BorrowLogic = new BorrowLogic(chainId);
    const ifaceComet = Comet__factory.createInterface();
    const account = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';

    const testCases: LogicTestCase<BorrowLogicFields>[] = [
      { fields: { marketId: MarketId.USDC, output: new common.TokenAmount(mainnetTokens.USDC, '1') } },
      { fields: { marketId: MarketId.ETH, output: new common.TokenAmount(mainnetTokens.ETH, '1') } },
      { fields: { marketId: MarketId.ETH, output: new common.TokenAmount(mainnetTokens.WETH, '1') } },
    ];

    testCases.forEach(({ fields }) => {
      it(`borrow ${fields.output.token.symbol} from ${fields.marketId} market`, async function () {
        const routerLogic = await compoundV3BorrowLogic.getLogic(fields, { account });
        const sig = routerLogic.data.substring(0, 10);
        const { marketId, output } = fields;
        const market = getMarket(chainId, marketId);

        expect(routerLogic.to).to.eq(market.cometAddress);
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        expect(sig).to.eq(ifaceComet.getSighash('withdrawFrom'));
        expect(routerLogic.inputs).to.deep.eq([]);
        expect(routerLogic.wrapMode).to.eq(output.token.isNative ? core.WrapMode.unwrapAfter : core.WrapMode.none);
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

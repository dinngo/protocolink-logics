import { Comet__factory } from './contracts';
import { LogicTestCase } from 'test/types';
import { MarketId, getMarket } from './config';
import { SupplyCollateralLogic, SupplyCollateralLogicFields } from './logic.supply-collateral';
import * as common from '@furucombo/composable-router-common';
import { constants, utils } from 'ethers';
import * as core from '@furucombo/composable-router-core';
import { expect } from 'chai';
import { mainnetTokens } from './tokens';

describe('CompoundV3 SupplyCollateralLogic', function () {
  context('Test getTokenList', async function () {
    SupplyCollateralLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.getNetworkId(chainId)}`, async function () {
        const logic = new SupplyCollateralLogic(chainId);
        const tokenList = await logic.getTokenList();
        expect(Object.keys(tokenList)).to.have.lengthOf.above(0);
        for (const marketId of Object.keys(tokenList)) {
          expect(tokenList[marketId]).to.have.lengthOf.above(0);
        }
      });
    });
  });

  context('Test build', function () {
    const chainId = common.ChainId.mainnet;
    const logic = new SupplyCollateralLogic(chainId);
    const iface = Comet__factory.createInterface();
    const account = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';

    const testCases: LogicTestCase<SupplyCollateralLogicFields>[] = [
      {
        fields: { marketId: MarketId.USDC, input: new common.TokenAmount(mainnetTokens.ETH, '1') },
      },
      {
        fields: { marketId: MarketId.USDC, input: new common.TokenAmount(mainnetTokens.ETH, '1'), balanceBps: 5000 },
      },
      {
        fields: { marketId: MarketId.USDC, input: new common.TokenAmount(mainnetTokens.WETH, '1') },
      },
      {
        fields: { marketId: MarketId.USDC, input: new common.TokenAmount(mainnetTokens.WETH, '1'), balanceBps: 5000 },
      },
      {
        fields: { marketId: MarketId.USDC, input: new common.TokenAmount(mainnetTokens.WBTC, '1') },
      },
      {
        fields: { marketId: MarketId.USDC, input: new common.TokenAmount(mainnetTokens.WBTC, '1'), balanceBps: 5000 },
      },
      {
        fields: { marketId: MarketId.ETH, input: new common.TokenAmount(mainnetTokens.cbETH, '1') },
      },
      {
        fields: { marketId: MarketId.ETH, input: new common.TokenAmount(mainnetTokens.cbETH, '1'), balanceBps: 5000 },
      },
      {
        fields: { marketId: MarketId.ETH, input: new common.TokenAmount(mainnetTokens.wstETH, '1') },
      },
      {
        fields: { marketId: MarketId.ETH, input: new common.TokenAmount(mainnetTokens.wstETH, '1'), balanceBps: 5000 },
      },
    ];

    testCases.forEach(({ fields }) => {
      it(`supply ${fields.input.token.symbol} to ${fields.marketId} market${
        fields.balanceBps ? ' with balanceBps' : ''
      }`, async function () {
        const routerLogic = await logic.build(fields, { account });
        const sig = routerLogic.data.substring(0, 10);
        const { marketId, input, balanceBps } = fields;
        const market = getMarket(chainId, marketId);

        expect(routerLogic.to).to.eq(market.cometAddress);
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        expect(sig).to.eq(iface.getSighash('supplyTo'));
        expect(routerLogic.inputs[0].token).to.eq(input.token.wrapped.address);
        if (balanceBps) {
          expect(routerLogic.inputs[0].balanceBps).to.eq(balanceBps);
          expect(routerLogic.inputs[0].amountOrOffset).to.eq(64);
        } else {
          expect(routerLogic.inputs[0].balanceBps).to.eq(core.BPS_NOT_USED);
          expect(routerLogic.inputs[0].amountOrOffset).to.eq(input.amountWei);
        }
        expect(routerLogic.wrapMode).to.eq(input.token.isNative ? core.WrapMode.wrapBefore : core.WrapMode.none);
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

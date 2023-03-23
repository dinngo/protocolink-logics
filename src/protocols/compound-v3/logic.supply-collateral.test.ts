import { Comet__factory } from './contracts';
import { LogicTestCase } from 'test/types';
import { MarketId, getMarket } from './config';
import { SupplyCollateralLogic, SupplyCollateralLogicFields } from './logic.supply-collateral';
import * as common from '@composable-router/common';
import { constants, utils } from 'ethers';
import { expect } from 'chai';
import { mainnetTokens } from './tokens';

describe('CompoundV3 SupplyCollateralLogic', function () {
  context('Test getTokenList', async function () {
    SupplyCollateralLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.getNetworkId(chainId)}`, async function () {
        const compoundV3SupplyCollateralLogic = new SupplyCollateralLogic(chainId);
        const tokenList = await compoundV3SupplyCollateralLogic.getTokenList();
        expect(Object.keys(tokenList).length).to.be.gt(0);
        for (const marketId of Object.keys(tokenList)) {
          expect(tokenList[marketId].length).to.gt(0);
        }
      });
    });
  });

  context('Test getLogic', function () {
    const chainId = common.ChainId.mainnet;
    const compoundV3SupplyCollateralLogic = new SupplyCollateralLogic(chainId);
    const ifaceComet = Comet__factory.createInterface();
    const account = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';

    const testCases: LogicTestCase<SupplyCollateralLogicFields>[] = [
      { fields: { marketId: MarketId.USDC, input: new common.TokenAmount(mainnetTokens.ETH, '1') } },
      { fields: { marketId: MarketId.USDC, input: new common.TokenAmount(mainnetTokens.ETH, '1'), amountBps: 5000 } },
      { fields: { marketId: MarketId.USDC, input: new common.TokenAmount(mainnetTokens.WBTC, '1') } },
      { fields: { marketId: MarketId.USDC, input: new common.TokenAmount(mainnetTokens.WBTC, '1'), amountBps: 5000 } },
      { fields: { marketId: MarketId.ETH, input: new common.TokenAmount(mainnetTokens.cbETH, '1') } },
      { fields: { marketId: MarketId.ETH, input: new common.TokenAmount(mainnetTokens.cbETH, '1'), amountBps: 5000 } },
      { fields: { marketId: MarketId.ETH, input: new common.TokenAmount(mainnetTokens.wstETH, '1') } },
      { fields: { marketId: MarketId.ETH, input: new common.TokenAmount(mainnetTokens.wstETH, '1'), amountBps: 5000 } },
    ];

    testCases.forEach(({ fields }) => {
      it(`supply ${fields.input.token.symbol} to ${fields.marketId} market${
        fields.amountBps ? ' with amountBps' : ''
      }`, async function () {
        const routerLogic = await compoundV3SupplyCollateralLogic.getLogic(fields, { account });
        const sig = routerLogic.data.substring(0, 10);
        const { marketId, input, amountBps } = fields;
        const market = getMarket(chainId, marketId);
        const ifaceBulker = new utils.Interface(market.bulker.abi);

        if (input.token.isNative) {
          expect(routerLogic.to).to.eq(market.bulker.address);
          expect(sig).to.eq(ifaceBulker.getSighash('invoke'));
          expect(routerLogic.inputs[0].token).to.eq(common.ELASTIC_ADDRESS);
        } else {
          expect(routerLogic.to).to.eq(market.cometAddress);
          expect(sig).to.eq(ifaceComet.getSighash('supplyTo'));
        }
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        if (amountBps) {
          expect(routerLogic.inputs[0].amountBps).to.eq(amountBps);
          expect(routerLogic.inputs[0].amountOrOffset).to.eq(input.token.isNative ? constants.MaxUint256 : 64);
        } else {
          expect(routerLogic.inputs[0].amountBps).to.eq(constants.MaxUint256);
          expect(routerLogic.inputs[0].amountOrOffset).to.eq(input.amountWei);
        }
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

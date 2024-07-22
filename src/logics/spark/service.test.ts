import { Service } from './service';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import { mainnetTokens } from './tokens';
import omit from 'lodash/omit';

describe('Spark Service', function () {
  const chainIds = [common.ChainId.mainnet];

  context('Test getReserveTokens', function () {
    chainIds.forEach((chainId) => {
      it(common.toNetworkId(chainId), async function () {
        const service = new Service(chainId);
        const { reserveTokens, reserveMap } = await service.getReserveTokens();

        expect(reserveTokens).to.have.lengthOf.above(0);
        expect(Object.keys(reserveMap)).to.have.lengthOf.above(0);
      });
    });
  });

  context('Test getSupplyTokens', function () {
    chainIds.forEach((chainId) => {
      it(common.toNetworkId(chainId), async function () {
        const service = new Service(chainId);
        const supplyTokens = await service.getSupplyTokens();
        expect(supplyTokens).to.have.lengthOf.above(0);
        expect(supplyTokens.every(({ isSupplyEnabled }) => isSupplyEnabled)).to.be.true;
      });
    });
  });

  context('Test getBorrowTokens', function () {
    chainIds.forEach((chainId) => {
      it(common.toNetworkId(chainId), async function () {
        const service = new Service(chainId);
        const borrowTokens = await service.getBorrowTokens();
        expect(borrowTokens).to.have.lengthOf.above(0);
        expect(borrowTokens.every(({ isBorrowEnabled }) => isBorrowEnabled)).to.be.true;
      });
    });
  });

  context('Test toAToken', function () {
    const service = new Service(common.ChainId.mainnet);

    const testCases = [
      { asset: mainnetTokens.WETH, expected: mainnetTokens.spWETH },
      { asset: mainnetTokens.USDC, expected: mainnetTokens.spUSDC },
    ];

    testCases.forEach(({ asset, expected }) => {
      it(`${asset.symbol} to ${expected.symbol}`, async function () {
        const aToken = await service.toAToken(asset);
        expect(aToken.toObject()).to.deep.eq(expected.toObject());
      });
    });
  });

  context('Test toAsset', function () {
    const service = new Service(common.ChainId.mainnet);

    const testCases = [
      { aToken: mainnetTokens.spWETH, expected: mainnetTokens.WETH },
      { aToken: mainnetTokens.spUSDC, expected: mainnetTokens.USDC },
    ];

    testCases.forEach(({ aToken, expected }) => {
      it(`${aToken.symbol} to ${expected.symbol}`, async function () {
        const asset = await service.toAsset(aToken);
        expect(JSON.stringify(omit(asset.toObject(), 'logoUri'))).to.eq(
          JSON.stringify(omit(expected.toObject(), 'logoUri'))
        );
      });
    });
  });

  context('Test getFlashLoanConfiguration', function () {
    const service = new Service(common.ChainId.mainnet);

    const testCases = [
      { assets: [mainnetTokens.WETH, mainnetTokens.USDC] },
      { assets: [mainnetTokens.WBTC, mainnetTokens.USDT] },
    ];

    testCases.forEach(({ assets }, i) => {
      it(`case ${i + 1}`, async function () {
        const flashLoanConfiguration = await service.getFlashLoanConfiguration(assets);
        expect(flashLoanConfiguration).to.have.keys('feeBps', 'assetInfos');
        expect(flashLoanConfiguration.assetInfos).to.have.lengthOf.above(0);
        for (const assetInfo of flashLoanConfiguration.assetInfos) {
          expect(assetInfo).to.have.keys('isPaused', 'isActive', 'isFlashLoanEnabled', 'availableToBorrow');
        }
      });
    });
  });
});

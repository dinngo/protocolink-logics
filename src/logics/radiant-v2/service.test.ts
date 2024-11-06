import { Service } from './service';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import { mainnetTokens } from './tokens';
import omit from 'lodash/omit';

describe('RadiantV2 Service', () => {
  const chainIds = [common.ChainId.mainnet];

  context('Test getReserveTokens', () => {
    chainIds.forEach((chainId) => {
      it(common.toNetworkId(chainId), async () => {
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

  context('Test toRToken', () => {
    const service = new Service(common.ChainId.mainnet);

    const testCases = [
      { asset: mainnetTokens.WETH, expected: mainnetTokens.rWETH },
      { asset: mainnetTokens.USDC, expected: mainnetTokens.rUSDC },
    ];

    testCases.forEach(({ asset, expected }) => {
      it(`${asset.symbol} to ${expected.symbol}`, async () => {
        const rToken = await service.toRToken(asset);
        expect(JSON.stringify(omit(rToken.toObject(), 'logoUri'))).to.eq(
          JSON.stringify(omit(expected.toObject(), 'logoUri'))
        );
      });
    });
  });

  context('Test toAsset', () => {
    const service = new Service(common.ChainId.mainnet);

    const testCases = [
      { rToken: mainnetTokens.rWETH, expected: mainnetTokens.WETH },
      { rToken: mainnetTokens.rUSDC, expected: mainnetTokens.USDC },
    ];

    testCases.forEach(({ rToken, expected }) => {
      it(`${rToken.symbol} to ${expected.symbol}`, async () => {
        const asset = await service.toAsset(rToken);
        expect(JSON.stringify(omit(asset.toObject(), 'logoUri'))).to.eq(
          JSON.stringify(omit(expected.toObject(), 'logoUri'))
        );
      });
    });
  });

  context('Test getFlashLoanConfiguration', () => {
    const service = new Service(common.ChainId.mainnet);

    const testCases = [
      { assets: [mainnetTokens.WETH, mainnetTokens.USDC] },
      { assets: [mainnetTokens.WBTC, mainnetTokens.USDT] },
    ];

    testCases.forEach(({ assets }, i) => {
      it(`case ${i + 1}`, async () => {
        const flashLoanConfiguration = await service.getFlashLoanConfiguration(assets);
        expect(flashLoanConfiguration).to.have.keys('feeBps', 'assetInfos');
        expect(flashLoanConfiguration.assetInfos).to.have.lengthOf.above(0);
        for (const assetInfo of flashLoanConfiguration.assetInfos) {
          expect(assetInfo).to.have.keys('isActive', 'availableToBorrow');
        }
      });
    });
  });
});

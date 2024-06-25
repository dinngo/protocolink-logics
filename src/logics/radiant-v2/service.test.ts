import { Service } from './service';
import { arbitrumTokens } from './tokens';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import omit from 'lodash/omit';

describe('RadiantV2 Service', () => {
  const chainIds = [common.ChainId.arbitrum];

  context('Test getReserveTokensAddresses', () => {
    chainIds.forEach((chainId) => {
      it(common.toNetworkId(chainId), async () => {
        const service = new Service(chainId);
        const reserveTokensAddresses = await service.getReserveTokensAddresses();
        expect(reserveTokensAddresses).to.have.lengthOf.above(0);
      });
    });
  });

  context('Test toRToken', () => {
    const service = new Service(common.ChainId.arbitrum);

    const testCases = [
      { asset: arbitrumTokens.WETH, expected: arbitrumTokens.rWETH },
      { asset: arbitrumTokens.USDC, expected: arbitrumTokens.rUSDCn },
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
    const service = new Service(common.ChainId.arbitrum);

    const testCases = [
      { rToken: arbitrumTokens.rWETH, expected: arbitrumTokens.WETH },
      { rToken: arbitrumTokens.rUSDCn, expected: arbitrumTokens.USDC },
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
    const service = new Service(common.ChainId.arbitrum);

    const testCases = [
      { assets: [arbitrumTokens.WETH, arbitrumTokens.USDC] },
      { assets: [arbitrumTokens.WBTC, arbitrumTokens.USDT] },
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

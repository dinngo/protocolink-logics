import { Service } from './service';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import { mainnetTokens } from './tokens';

describe('AaveV2 Service', function () {
  const chainIds = [common.ChainId.mainnet];

  context('Test getReserveTokensAddresses', function () {
    chainIds.forEach((chainId) => {
      it(common.getNetworkId(chainId), async function () {
        const service = new Service(chainId);
        const reserveTokensAddresses = await service.getReserveTokensAddresses();
        expect(reserveTokensAddresses).to.have.lengthOf.above(0);
      });
    });
  });

  context('Test toAToken', function () {
    const service = new Service(common.ChainId.mainnet);

    const testCases = [
      { asset: mainnetTokens.WETH, expected: mainnetTokens.aWETH },
      { asset: mainnetTokens.USDC, expected: mainnetTokens.aUSDC },
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
      { aToken: mainnetTokens.aWETH, expected: mainnetTokens.WETH },
      { aToken: mainnetTokens.aUSDC, expected: mainnetTokens.USDC },
    ];

    testCases.forEach(({ aToken, expected }) => {
      it(`${aToken.symbol} to ${expected.symbol}`, async function () {
        const asset = await service.toAsset(aToken);
        expect(asset.toObject()).to.deep.eq(expected.toObject());
      });
    });
  });
});

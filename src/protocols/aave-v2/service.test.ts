import { AaveV2Service } from './service';
import * as core from 'src/core';
import { expect } from 'chai';
import { mainnet } from './tokens';
import { utils } from 'ethers';

describe('AaveV2Service', function () {
  const chainIds = [core.network.ChainId.mainnet];

  context('Test getReserveTokensAddresses', function () {
    chainIds.forEach((chainId) => {
      it(core.network.getNetworkId(chainId), async function () {
        const service = new AaveV2Service({ chainId });
        const reserveTokensAddresses = await service.getReserveTokensAddresses();
        expect(reserveTokensAddresses.length).to.eq(22);
      });
    });
  });

  context('Test getWETHGatewayAddress', function () {
    chainIds.forEach((chainId) => {
      it(core.network.getNetworkId(chainId), async function () {
        const service = new AaveV2Service({ chainId });
        const wethGatewayAddress = await service.getWETHGatewayAddress();
        expect(utils.isAddress(wethGatewayAddress)).to.be.true;
      });
    });
  });

  context('Test toAToken', function () {
    const chainId = core.network.ChainId.mainnet;
    const service = new AaveV2Service({ chainId });

    const cases = [
      { asset: core.tokens.mainnet.ETH, expected: mainnet.aWETH },
      { asset: mainnet.WETH, expected: mainnet.aWETH },
      { asset: mainnet.USDC, expected: mainnet.aUSDC },
    ];

    cases.forEach(({ asset, expected }) => {
      it(`${asset.symbol} to ${expected.symbol}`, async function () {
        const aToken = await service.toAToken(asset);
        expect(aToken.toObject()).to.deep.eq(expected.toObject());
      });
    });
  });

  context('Test toAsset', function () {
    const chainId = core.network.ChainId.mainnet;
    const service = new AaveV2Service({ chainId });

    const cases = [
      { aToken: mainnet.aWETH, expected: mainnet.WETH },
      { aToken: mainnet.aUSDC, expected: mainnet.USDC },
    ];

    cases.forEach(({ aToken, expected }) => {
      it(`${aToken.symbol} to ${expected.symbol}`, async function () {
        const asset = await service.toAsset(aToken);
        expect(asset.toObject()).to.deep.eq(expected.toObject());
      });
    });
  });
});

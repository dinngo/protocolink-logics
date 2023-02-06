import { AaveV2Service } from './service';
import * as core from 'src/core';
import { expect } from 'chai';

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
});

import { Service } from './service';
import * as common from '@composable-router/common';
import { expect } from 'chai';
import { getMarkets } from './config';

describe('CompoundV3 Service', function () {
  const chainIds = [common.ChainId.mainnet, common.ChainId.polygon];

  context('Test getCollaterals', function () {
    chainIds.forEach((chainId) => {
      it(common.getNetworkId(chainId), async function () {
        const markets = getMarkets(chainId);
        const service = new Service(chainId);
        for (const market of markets) {
          const collaterals = await service.getCollaterals(market.id);
          expect(collaterals.length).to.gt(0);
        }
      });
    });
  });
});

import { MarketId, getMarkets } from './config';
import { Service } from './service';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import { mainnetTokens } from './tokens';

describe('CompoundV3 Service', function () {
  context('Test getCollaterals', function () {
    const chainIds = [common.ChainId.mainnet, common.ChainId.polygon];
    chainIds.forEach((chainId) => {
      it(common.toNetworkId(chainId), async function () {
        const markets = getMarkets(chainId);
        const service = new Service(chainId);
        for (const market of markets) {
          const collaterals = await service.getCollaterals(market.id);
          expect(collaterals).to.have.lengthOf.above(0);
        }
      });
    });
  });

  context('Test canSupply', function () {
    const chainId = common.ChainId.mainnet;
    const service = new Service(chainId);

    const testCases = [
      { marketId: MarketId.USDC, supply: new common.TokenAmount(mainnetTokens.WBTC, '1') },
      { marketId: MarketId.ETH, supply: new common.TokenAmount(mainnetTokens.cbETH, '1') },
    ];

    testCases.forEach(({ marketId, supply }, i) => {
      it(`case ${i + 1}`, async function () {
        const canSupply = await service.canSupply(marketId, supply);
        expect(canSupply).is.a('boolean');
      });
    });
  });
});

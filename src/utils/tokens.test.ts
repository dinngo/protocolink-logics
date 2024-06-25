import * as common from '@protocolink/common';
import { expect } from 'chai';
import { getUnifiedTokens } from './tokens';

describe('Test tokens', function () {
  common.networks.forEach(({ chainId }) => {
    it(`network: ${common.toNetworkId(chainId)}`, async function () {
      const tokens = await getUnifiedTokens(chainId);
      expect(tokens).to.have.lengthOf.above(0);
    });
  });
});

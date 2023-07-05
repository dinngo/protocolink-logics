import * as common from '@protocolink/common';
import { expect } from 'chai';
import { get1InchTokens } from './tokens';

describe('Test get1InchTokens', function () {
  common.networks.forEach(({ chainId }) => {
    it(`network: ${common.toNetworkId(chainId)}`, async function () {
      const tokens = await get1InchTokens(chainId);
      expect(tokens).to.have.lengthOf.above(0);
    });
  });
});

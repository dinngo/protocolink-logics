import * as common from '@protocolink/common';
import { expect } from 'chai';
import { get1InchTokens, getMetisTokens } from './tokens';

describe('Test tokens', function () {
  common.networks.forEach(({ chainId }) => {
    it(`network: ${common.toNetworkId(chainId)}`, async function () {
      let tokens;
      if (chainId === 1088) tokens = await getMetisTokens();
      else tokens = await get1InchTokens(chainId);
      expect(tokens).to.have.lengthOf.above(0);
    });
  });
});

import * as common from '@protocolink/common';
import { expect } from 'chai';
import { get1InchTokens, getDefaultTokenListUrls, getMetisTokens, getTokenList } from './tokens';

describe('Test tokens', function () {
  common.networks.forEach(({ chainId }) => {
    it(`network: ${common.toNetworkId(chainId)}`, async function () {
      const tokens = chainId === common.ChainId.metis ? await getMetisTokens() : await get1InchTokens(chainId);
      expect(tokens).to.have.lengthOf.above(0);
    });
  });
});

const chainsToTest = [
  common.ChainId.mainnet,
  common.ChainId.optimism,
  common.ChainId.polygon,
  common.ChainId.base,
  common.ChainId.arbitrum,
  common.ChainId.avalanche,
];

describe('Test getDefaultTokenListUrls', function () {
  chainsToTest.forEach((chainId) => {
    it(`network: ${common.toNetworkId(chainId)}`, function () {
      const urls = getDefaultTokenListUrls(chainId);
      expect(urls).to.have.lengthOf.above(0);
    });
  });
});

describe('Test getTokenList', function () {
  chainsToTest.forEach((chainId) => {
    it(`network: ${common.toNetworkId(chainId)}`, async function () {
      const tokenListUrls = getDefaultTokenListUrls(chainId);
      const tokens = await getTokenList(tokenListUrls, chainId, []);
      expect(tokens).to.have.lengthOf.above(0);
      expect(tokens.every((token) => token.address && token.chainId && token.decimals && token.name && token.symbol)).to
        .be.true;
      expect(tokens.every((token) => token.chainId === chainId)).to.be.true;
    });

    it(`network: ${common.toNetworkId(chainId)}, defaultTokenList`, async function () {
      const defaultTokenList = [common.getNativeToken(chainId)];
      const tokens = await getTokenList([], chainId, defaultTokenList);
      expect(tokens).to.have.lengthOf(1);
      expect(tokens).to.deep.eq(defaultTokenList);
    });
  });
});

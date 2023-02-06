import { Web3Toolkit } from './web3-toolkit';
import { expect } from 'chai';
import * as network from './network';
import * as tokens from './tokens';

describe('Web3Toolkit', function () {
  const chainId = network.ChainId.mainnet;
  const web3Toolkit = new Web3Toolkit({ chainId });

  context('Test getToken', function () {
    const cases = [
      { tokenAddress: tokens.mainnet.ETH.address, expected: tokens.mainnet.ETH },
      { tokenAddress: tokens.ELASTIC_ADDRESS, expected: tokens.mainnet.ETH },
      { tokenAddress: tokens.mainnet.USDC.address, expected: tokens.mainnet.USDC },
      { tokenAddress: tokens.mainnet.WETH.address, expected: tokens.mainnet.WETH },
      { tokenAddress: tokens.mainnet.MKR.address, expected: tokens.mainnet.MKR },
    ];

    cases.forEach(({ tokenAddress, expected }) => {
      it(`${expected.symbol}`, async function () {
        const token = await web3Toolkit.getToken(tokenAddress);
        expect(token.toObject()).to.deep.eq(expected.toObject());
      });
    });
  });

  context('Test getTokens', function () {
    const cases = [
      {
        tokenAddresses: [
          tokens.mainnet.USDC.address,
          tokens.mainnet.ETH.address,
          tokens.mainnet.WETH.address,
          tokens.ELASTIC_ADDRESS,
          tokens.mainnet.DAI.address,
        ],
        expected: [
          tokens.mainnet.USDC,
          tokens.mainnet.ETH,
          tokens.mainnet.WETH,
          tokens.mainnet.ETH,
          tokens.mainnet.DAI,
        ],
      },
    ];

    cases.forEach(({ tokenAddresses, expected }, i) => {
      it(`case ${i + 1}`, async function () {
        const tokens = await web3Toolkit.getTokens(tokenAddresses);
        tokens.forEach((token, i) => {
          expect(token.toObject()).to.deep.eq(expected[i].toObject());
        });
      });
    });
  });
});

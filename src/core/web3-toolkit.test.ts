import { ChainId } from './network';
import { ELASTIC_ADDRESS, mainnet } from './tokens';
import { Web3Toolkit } from './web3-toolkit';
import { expect } from 'chai';

describe('Web3Toolkit', function () {
  const chainId = ChainId.mainnet;
  const web3Toolkit = new Web3Toolkit({ chainId });

  context('Test getToken', function () {
    const cases = [
      { tokenAddress: mainnet.ETH.address, expected: mainnet.ETH },
      { tokenAddress: ELASTIC_ADDRESS, expected: mainnet.ETH },
      { tokenAddress: mainnet.USDC.address, expected: mainnet.USDC },
      { tokenAddress: mainnet.WETH.address, expected: mainnet.WETH },
      { tokenAddress: mainnet.MKR.address, expected: mainnet.MKR },
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
          mainnet.USDC.address,
          mainnet.ETH.address,
          mainnet.WETH.address,
          ELASTIC_ADDRESS,
          mainnet.DAI.address,
        ],
        expected: [mainnet.USDC, mainnet.ETH, mainnet.WETH, mainnet.ETH, mainnet.DAI],
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

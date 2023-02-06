/* eslint-disable max-len */

import { Token } from './token';
import { expect } from 'chai';
import { mainnet } from './data';

describe('Token', function () {
  context('Test new instance', function () {
    it('args', function () {
      const chainId = 1;
      const address = '0x0000000000000000000000000000000000000000';
      const decimals = 18;
      const symbol = 'ETH';
      const name = 'Ethereum';
      const token = new Token(chainId, address, decimals, symbol, name);
      expect(token.chainId).to.eq(chainId);
      expect(token.address).to.eq(address);
      expect(token.decimals).to.eq(decimals);
      expect(token.symbol).to.eq(symbol);
      expect(token.name).to.eq(name);
    });

    it('TokenObject', function () {
      const tokenObject = {
        chainId: 1,
        address: '0x0000000000000000000000000000000000000000',
        decimals: 18,
        symbol: 'ETH',
        name: 'Ethereum',
      };
      const token = new Token(tokenObject);
      expect(token.chainId).to.eq(tokenObject.chainId);
      expect(token.address).to.eq(tokenObject.address);
      expect(token.decimals).to.eq(tokenObject.decimals);
      expect(token.symbol).to.eq(tokenObject.symbol);
      expect(token.name).to.eq(tokenObject.name);
    });
  });

  context('Test toObject', function () {
    const cases = [
      {
        token: mainnet.ETH,
        expected: {
          chainId: 1,
          address: '0x0000000000000000000000000000000000000000',
          decimals: 18,
          symbol: 'ETH',
          name: 'Ethereum',
        },
      },
      {
        token: mainnet.USDC,
        expected: {
          chainId: 1,
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          decimals: 6,
          symbol: 'USDC',
          name: 'USD Coin',
        },
      },
    ];

    cases.forEach(({ token, expected }, i) => {
      it(`case ${i + 1}`, function () {
        expect(token.toObject()).to.deep.eq(expected);
      });
    });
  });

  context('Test toJSON', function () {
    const cases = [
      {
        token: mainnet.ETH,
        expected: `{"chainId":1,"address":"0x0000000000000000000000000000000000000000","decimals":18,"symbol":"ETH","name":"Ethereum"}`,
      },
      {
        token: mainnet.USDC,
        expected: `{"chainId":1,"address":"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48","decimals":6,"symbol":"USDC","name":"USD Coin"}`,
      },
    ];

    cases.forEach(({ token, expected }, i) => {
      it(`case ${i + 1}`, function () {
        expect(JSON.stringify(token)).to.eq(expected);
      });
    });
  });
});

/* eslint-disable max-len */

import { ELASTIC_ADDRESS } from './constants';
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

  context('Test isNative', function () {
    const cases = [
      {
        token: mainnet.ETH,
        expected: true,
      },
      {
        token: mainnet.WETH,
        expected: false,
      },
      {
        token: mainnet.USDC,
        expected: false,
      },
    ];

    cases.forEach(({ token, expected }, i) => {
      it(`case ${i + 1}`, function () {
        expect(token.isNative()).to.eq(expected);
      });
    });
  });

  context('Test isWrapped', function () {
    const cases = [
      {
        token: mainnet.ETH,
        expected: false,
      },
      {
        token: mainnet.WETH,
        expected: true,
      },
      {
        token: mainnet.USDC,
        expected: false,
      },
    ];

    cases.forEach(({ token, expected }, i) => {
      it(`case ${i + 1}`, function () {
        expect(token.isWrapped()).to.eq(expected);
      });
    });
  });

  context('Test wrapped', function () {
    const cases = [
      {
        token: mainnet.ETH,
        expected: mainnet.WETH,
      },
      {
        token: mainnet.WETH,
        expected: mainnet.WETH,
      },
      {
        token: mainnet.USDC,
        expected: mainnet.USDC,
      },
    ];

    cases.forEach(({ token, expected }, i) => {
      it(`case ${i + 1}`, function () {
        expect(token.wrapped().toObject()).to.deep.eq(expected.toObject());
      });
    });
  });

  context('Test elasticAddress', function () {
    const cases = [
      {
        token: mainnet.ETH,
        expected: ELASTIC_ADDRESS,
      },
      {
        token: mainnet.WETH,
        expected: mainnet.WETH.address,
      },
      {
        token: mainnet.USDC,
        expected: mainnet.USDC.address,
      },
    ];

    cases.forEach(({ token, expected }, i) => {
      it(`case ${i + 1}`, function () {
        expect(token.elasticAddress).to.deep.eq(expected);
      });
    });
  });

  context('Test sortsBefore', function () {
    const cases = [
      {
        token0: mainnet.ETH,
        token1: mainnet.USDC,
        expected: false,
      },
      {
        token0: mainnet.USDC,
        token1: mainnet.ETH,
        expected: true,
      },
      {
        token0: mainnet.WETH,
        token1: mainnet.USDC,
        expected: false,
      },
      {
        token0: mainnet.USDC,
        token1: mainnet.WETH,
        expected: true,
      },
      {
        token0: mainnet.DAI,
        token1: mainnet.USDC,
        expected: true,
      },
      {
        token0: mainnet.USDC,
        token1: mainnet.DAI,
        expected: false,
      },
    ];

    cases.forEach(({ token0, token1, expected }, i) => {
      it(`case ${i + 1}`, function () {
        expect(token0.sortsBefore(token1)).to.eq(expected);
      });
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

  context('Test JSON.stringify(token)', function () {
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

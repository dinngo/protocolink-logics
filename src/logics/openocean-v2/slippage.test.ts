import { expect } from 'chai';
import { slippageToOpenOcean, slippageToProtocolink } from './slippage';

describe('Test slippageToOpenOcean', function () {
  const testCases = [
    {
      title: 'in range integer',
      slippage: 100,
      expected: 1,
    },
    {
      title: 'in range floating number',
      slippage: 150,
      expected: 1.5,
    },
    {
      title: 'out of range minimal',
      slippage: 0,
      expected: 0.05,
    },
    {
      title: 'out of range maximal',
      slippage: 10000,
      expected: 50,
    },
  ];

  testCases.forEach(({ title, slippage, expected }) => {
    it(title, function () {
      expect(slippageToOpenOcean(slippage) === expected).to.be.true;
    });
  });
});

describe('Test slippageToProtocolink', function () {
  const testCases = [
    {
      title: 'in range integer',
      slippage: 1,
      expected: 100,
    },
    {
      title: 'in range floating number',
      slippage: 1.5,
      expected: 150,
    },
  ];

  testCases.forEach(({ title, slippage, expected }) => {
    it(title, function () {
      expect(slippageToProtocolink(slippage) === expected).to.be.true;
    });
  });
});

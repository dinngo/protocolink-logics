import { expect } from 'chai';
import { slippageToProtocolink, slippageToZeroEx } from 'src/logics/zeroex-v4/slippage';

describe('Test slippageToZeroEx', function () {
  const testCases = [
    {
      title: 'integer',
      slippage: 200,
      expected: 0.02,
    },
    {
      title: 'float',
      slippage: 150,
      expected: 0.015,
    },
  ];

  testCases.forEach(({ title, slippage, expected }) => {
    it(title, function () {
      expect(slippageToZeroEx(slippage)).to.be.eq(expected);
    });
  });
});

describe('Test slippageToProtocolink', function () {
  const testCases = [
    {
      title: 'integer',
      slippage: '-0.02',
      expected: 200,
    },
    {
      title: 'float',
      slippage: '-0.015',
      expected: 150,
    },
    {
      title: 'float to round',
      slippage: '-0.014832439439483543',
      expected: 149,
    },
    {
      title: 'float out of range min',
      slippage: '-0.0000023545',
      expected: 50,
    },
  ];

  testCases.forEach(({ title, slippage, expected }) => {
    it(title, function () {
      expect(slippageToProtocolink(slippage)).to.be.eq(expected);
    });
  });
});

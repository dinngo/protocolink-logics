import { expect } from 'chai';
import { slippageToZeroEx } from 'src/logics/zeroex-v4/slippage';
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

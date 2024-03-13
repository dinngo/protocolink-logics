import * as common from '@protocolink/common';
import { expect } from 'chai';
import { isWrapOrUnwrap } from 'src/logics/zeroex-v4/utils';

describe('Test isWrapOrUnwrap', () => {
  const nativeTokenRaw = common.getNetwork(1).nativeToken;
  const wrappedNativeTokenRaw = common.getNetwork(1).wrappedNativeToken;
  const nativeToken = new common.Token(
    1,
    nativeTokenRaw.address,
    nativeTokenRaw.decimals,
    nativeTokenRaw.symbol,
    nativeTokenRaw.name
  );
  const wrappedNativeToken = new common.Token(
    1,
    wrappedNativeTokenRaw.address,
    wrappedNativeTokenRaw.decimals,
    wrappedNativeTokenRaw.symbol,
    wrappedNativeTokenRaw.name
  );
  const nativeTokens = {
    nativeToken,
    wrappedNativeToken,
  };

  const randomToken = new common.Token(1, '0x226de9B08e19908668C63185a635218005999999', 18, 'ABC', 'ABC');
  const randomTokenAmount = new common.TokenAmount(randomToken, '100');

  const nativeTokenAmount = new common.TokenAmount(nativeToken, '1');
  const wrappedNativeTokenAmount = new common.TokenAmount(wrappedNativeToken, '1');

  const testCases = [
    {
      title: 'wrap',
      input: nativeTokenAmount,
      output: wrappedNativeTokenAmount,
      ...nativeTokens,
      expected: true,
    },
    {
      title: 'unwrap',
      input: wrappedNativeTokenAmount,
      output: nativeTokenAmount,
      ...nativeTokens,
      expected: true,
    },
    {
      title: 'not wrap or unwrap',
      input: nativeTokenAmount,
      output: randomTokenAmount,
      ...nativeTokens,
      expected: false,
    },
  ];

  testCases.forEach((testCase) => {
    it(`should return ${testCase.expected} for ${testCase.title}`, () => {
      expect(
        isWrapOrUnwrap(testCase.input, testCase.output, testCase.nativeToken, testCase.wrappedNativeToken)
      ).to.be.eq(testCase.expected);
    });
  });
});

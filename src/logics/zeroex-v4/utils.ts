import * as common from '@protocolink/common';

export function isWrapOrUnwrap(
  input: common.TokenAmount,
  output: common.TokenAmount,
  nativeToken: common.Token,
  wrappedNativeToken: common.Token
) {
  const tokens = [input.token.elasticAddress, output.token.elasticAddress];
  return tokens.includes(nativeToken.elasticAddress) && tokens.includes(wrappedNativeToken.elasticAddress);
}

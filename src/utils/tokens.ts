import * as common from '@protocolink/common';

export async function getUnifiedTokens(chainId: number, { isSkipNative = false } = {}) {
  const tokenList = Object.values(await common.getUnifiedTokens(chainId));
  return isSkipNative ? tokenList.filter((token) => !token.is(common.getNativeToken(chainId))) : tokenList;
}

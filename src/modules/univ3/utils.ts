import { Token } from '@uniswap/sdk-core';
import * as common from '@protocolink/common';

export function toUniToken(token: common.TokenTypes) {
  return new Token(token.chainId, token.address, token.decimals, token.symbol, token.name);
}

export function toPTLKToken(token: Token) {
  return new common.Token(token.chainId, token.address, token.decimals, token.symbol!, token.name!);
}

export function toTokenMap<T extends string>(tokenObjectMap: Record<string, common.TokenObject>): Record<T, Token> {
  return Object.keys(tokenObjectMap).reduce((accumulator, symbol) => {
    accumulator[symbol] = toUniToken(tokenObjectMap[symbol]);
    return accumulator;
  }, {} as Record<string, Token>);
}

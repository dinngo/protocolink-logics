import { DEFAULT_DEADLINE_FROM_NOW, L2_DEADLINE_FROM_NOW } from './constants';
import { Token } from '@uniswap/sdk-core';
import * as common from '@furucombo/composable-router-common';

export function toUniToken(token: common.TokenTypes) {
  return new Token(token.chainId, token.address, token.decimals, token.symbol, token.name);
}

export function toTokenMap<T extends string>(tokenObjectMap: Record<string, common.TokenObject>): Record<T, Token> {
  return Object.keys(tokenObjectMap).reduce((accumulator, symbol) => {
    accumulator[symbol] = toUniToken(tokenObjectMap[symbol]);
    return accumulator;
  }, {} as Record<string, Token>);
}

export function getDeadline(chainId: number) {
  const fromNow = chainId === common.ChainId.mainnet ? DEFAULT_DEADLINE_FROM_NOW : L2_DEADLINE_FROM_NOW;
  return Math.floor(Date.now() / 1000) + fromNow;
}

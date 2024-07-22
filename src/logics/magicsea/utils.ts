import { BigintIsh, Currency, Token, TokenAmount } from '@uniswap/sdk';
import * as common from '@protocolink/common';

export function toCurrency(token: common.TokenTypes): Currency {
  return toUniToken(token);
}

// token must be wrapped
export function toCurrencyAmount(token: common.TokenTypes, amount: BigintIsh): TokenAmount {
  return new TokenAmount(toUniToken(token), amount);
}

export function toUniToken(token: common.TokenTypes) {
  return new Token(token.chainId, token.address, token.decimals, token.symbol, token.name);
}

export function toToken(token: Token) {
  return new common.Token(token.chainId, token.address, token.decimals, token.symbol!, token.name!);
}

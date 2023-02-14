import cTokensJSON from './data/cTokens.json';
import * as core from 'src/core';
import underlyingTokensJSON from './data/underlyingTokens.json';

export const COMP = new core.tokens.Token(1, '0xc00e94Cb662C3520282E6f5717214004A7f26888', 18, 'COMP', 'Compound');

type CTokenSymbols = keyof typeof cTokensJSON;

export const cTokens = core.tokens.toTokenMap<CTokenSymbols>(cTokensJSON);

type UnderlyingTokenSymbols = keyof typeof underlyingTokensJSON;

export const underlyingTokens = core.tokens.toTokenMap<UnderlyingTokenSymbols>(underlyingTokensJSON);

export const [tokenPairs, underlyingToCTokenMap, cTokenToUnderlyingMap] = Object.keys(underlyingTokensJSON).reduce(
  (accumulator, underlyingTokenSymbol) => {
    const underlyingToken = (underlyingTokens as Record<string, core.tokens.Token>)[underlyingTokenSymbol];
    const cToken = (cTokens as Record<string, core.tokens.Token>)[`c${underlyingTokenSymbol}`];
    accumulator[0].push({ cToken, underlyingToken });
    accumulator[1][underlyingToken.address] = cToken;
    accumulator[2][cToken.address] = underlyingToken;

    return accumulator;
  },
  [
    [] as Array<{ cToken: core.tokens.Token; underlyingToken: core.tokens.Token }>,
    {} as Record<string, core.tokens.Token>,
    {} as Record<string, core.tokens.Token>,
  ]
);

export function toUnderlyingToken(cToken: core.tokens.Token) {
  return cTokenToUnderlyingMap[cToken.address];
}

export function toCToken(underlyingToken: core.tokens.Token) {
  return underlyingToCTokenMap[underlyingToken.address];
}

export function isCToken(token: core.tokens.Token) {
  return token.symbol.startsWith('c') && token.name.startsWith('Compound');
}

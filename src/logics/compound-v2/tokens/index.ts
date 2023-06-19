import cTokensJSON from './data/cTokens.json';
import * as common from '@furucombo/composable-router-common';
import underlyingTokensJSON from './data/underlyingTokens.json';

export const COMP = new common.Token(1, '0xc00e94Cb662C3520282E6f5717214004A7f26888', 18, 'COMP', 'Compound');

type CTokenSymbols = keyof typeof cTokensJSON;

export const cTokens = common.toTokenMap<CTokenSymbols>(cTokensJSON);

type UnderlyingTokenSymbols = keyof typeof underlyingTokensJSON;

export const underlyingTokens = common.toTokenMap<UnderlyingTokenSymbols>(underlyingTokensJSON);

export const [tokenPairs, underlyingToCTokenMap, cTokenToUnderlyingMap] = Object.keys(underlyingTokensJSON).reduce(
  (accumulator, underlyingTokenSymbol) => {
    const underlyingToken = (underlyingTokens as Record<string, common.Token>)[underlyingTokenSymbol];
    const cToken = (cTokens as Record<string, common.Token>)[`c${underlyingTokenSymbol}`];
    accumulator[0].push({ cToken, underlyingToken });
    accumulator[1][underlyingToken.address] = cToken;
    accumulator[2][cToken.address] = underlyingToken;

    return accumulator;
  },
  [
    [] as Array<{ cToken: common.Token; underlyingToken: common.Token }>,
    {} as Record<string, common.Token>,
    {} as Record<string, common.Token>,
  ]
);

export function toUnderlyingToken(cTokenOrAddress: common.TokenOrAddress) {
  return cTokenToUnderlyingMap[common.Token.getAddress(cTokenOrAddress)];
}

export function toCToken(underlyingTokenOrAddress: common.TokenOrAddress) {
  return underlyingToCTokenMap[common.Token.getAddress(underlyingTokenOrAddress)];
}

export function isCToken(token: common.TokenTypes) {
  return token.symbol.startsWith('c') && token.name.startsWith('Compound');
}

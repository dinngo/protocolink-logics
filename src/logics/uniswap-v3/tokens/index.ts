import { Token, WETH9 } from '@uniswap/sdk-core';
import arbitrumTokensJSON from './data/arbitrum.json';
import * as common from '@protocolink/common';
import mainnetTokensJSON from './data/mainnet.json';
import optimismTokensJSON from './data/optimism.json';
import polygonTokensJSON from './data/polygon.json';
import * as univ3 from 'src/modules/univ3';

export const WRAPPED_NATIVE_CURRENCY: Record<number, Token> = {
  [common.ChainId.mainnet]: WETH9[common.ChainId.mainnet],
  [common.ChainId.polygon]: new Token(
    common.ChainId.polygon,
    '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    18,
    'WMATIC',
    'Wrapped MATIC'
  ),
  [common.ChainId.arbitrum]: new Token(
    common.ChainId.arbitrum,
    '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    18,
    'WETH',
    'Wrapped Ether'
  ),
  [common.ChainId.optimism]: new Token(
    common.ChainId.optimism,
    '0x4200000000000000000000000000000000000006',
    18,
    'WETH',
    'Wrapped Ether'
  ),
};

type MainnetTokenSymbols = keyof typeof mainnetTokensJSON;

export const mainnetTokens = univ3.toTokenMap<MainnetTokenSymbols>(mainnetTokensJSON);

type PolygonTokenSymbols = keyof typeof polygonTokensJSON;

export const polygonTokens = univ3.toTokenMap<PolygonTokenSymbols>(polygonTokensJSON);

type ArbitrumTokenSymbols = keyof typeof arbitrumTokensJSON;

export const arbitrumTokens = univ3.toTokenMap<ArbitrumTokenSymbols>(arbitrumTokensJSON);

type OptimismTokenSymbols = keyof typeof optimismTokensJSON;

export const optimismTokens = univ3.toTokenMap<OptimismTokenSymbols>(optimismTokensJSON);

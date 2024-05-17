import arbitrumTokensJSON from './data/arbitrum.json';
import avalancheTokensJSON from './data/avalanche.json';
import baseTokensJSON from './data/base.json';
import mainnetTokensJSON from './data/mainnet.json';
import optimismTokensJSON from './data/optimism.json';
import polygonTokensJSON from './data/polygon.json';
import * as univ3 from 'src/modules/univ3';

type MainnetTokenSymbols = keyof typeof mainnetTokensJSON;

export const mainnetTokens = univ3.toTokenMap<MainnetTokenSymbols>(mainnetTokensJSON);

type OptimismTokenSymbols = keyof typeof optimismTokensJSON;

export const optimismTokens = univ3.toTokenMap<OptimismTokenSymbols>(optimismTokensJSON);

type PolygonTokenSymbols = keyof typeof polygonTokensJSON;

export const polygonTokens = univ3.toTokenMap<PolygonTokenSymbols>(polygonTokensJSON);

type BaseTokenSymbols = keyof typeof baseTokensJSON;

export const baseTokens = univ3.toTokenMap<BaseTokenSymbols>(baseTokensJSON);

type ArbitrumTokenSymbols = keyof typeof arbitrumTokensJSON;

export const arbitrumTokens = univ3.toTokenMap<ArbitrumTokenSymbols>(arbitrumTokensJSON);

type AvalancheTokenSymbols = keyof typeof avalancheTokensJSON;

export const avalancheTokens = univ3.toTokenMap<AvalancheTokenSymbols>(avalancheTokensJSON);

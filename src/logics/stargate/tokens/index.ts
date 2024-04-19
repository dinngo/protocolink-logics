import arbitrumTokensJSON from './data/arbitrum.json';
import avalancheTokensJSON from './data/avalanche.json';
import baseTokensJSON from './data/base.json';
import * as common from '@protocolink/common';
import mainnetTokensJSON from './data/mainnet.json';
import metisTokensJSON from './data/metis.json';
import optimismTokensJSON from './data/optimism.json';
import polygonTokensJSON from './data/polygon.json';

type MainnetTokenSymbols = keyof typeof mainnetTokensJSON;

export const mainnetTokens = common.toTokenMap<MainnetTokenSymbols>(mainnetTokensJSON);

type OptimismTokenSymbols = keyof typeof optimismTokensJSON;

export const optimismTokens = common.toTokenMap<OptimismTokenSymbols>(optimismTokensJSON);

type PolygonTokenSymbols = keyof typeof polygonTokensJSON;

export const polygonTokens = common.toTokenMap<PolygonTokenSymbols>(polygonTokensJSON);

type MetisTokenSymbols = keyof typeof metisTokensJSON;

export const metisTokens = common.toTokenMap<MetisTokenSymbols>(metisTokensJSON);

type BaseTokenSymbols = keyof typeof baseTokensJSON;

export const baseTokens = common.toTokenMap<BaseTokenSymbols>(baseTokensJSON);

type ArbitrumTokenSymbols = keyof typeof arbitrumTokensJSON;

export const arbitrumTokens = common.toTokenMap<ArbitrumTokenSymbols>(arbitrumTokensJSON);

type AvalancheTokenSymbols = keyof typeof avalancheTokensJSON;

export const avalancheTokens = common.toTokenMap<AvalancheTokenSymbols>(avalancheTokensJSON);

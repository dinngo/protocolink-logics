import arbitrumTokensJSON from './data/arbitrum.json';
import avalancheTokensJSON from './data/avalanche.json';
import baseTokensJSON from './data/base.json';
import * as common from '@protocolink/common';
import mainnetTokensJSON from './data/mainnet.json';
import optimismTokensJSON from './data/optimism.json';
import polygonTokensJSON from './data/polygon.json';
import * as univ3 from 'src/modules/univ3';

type MainnetTokenSymbols = keyof typeof mainnetTokensJSON;
type CommonMainnetTokenSymbols = keyof typeof common.mainnetTokens;

export const mainnetTokens = {
  ...univ3.toTokenMap<MainnetTokenSymbols>(mainnetTokensJSON),
  ...univ3.toTokenMap<CommonMainnetTokenSymbols>(common.mainnetTokens),
};

type OptimismTokenSymbols = keyof typeof optimismTokensJSON;
type CommonOptimismTokenSymbols = keyof typeof common.optimismTokens;

export const optimismTokens = {
  ...univ3.toTokenMap<OptimismTokenSymbols>(optimismTokensJSON),
  ...univ3.toTokenMap<CommonOptimismTokenSymbols>(common.optimismTokens),
};

type PolygonTokenSymbols = keyof typeof polygonTokensJSON;
type CommonPolygonTokenSymbols = keyof typeof common.polygonTokens;

export const polygonTokens = {
  ...univ3.toTokenMap<PolygonTokenSymbols>(polygonTokensJSON),
  ...univ3.toTokenMap<CommonPolygonTokenSymbols>(common.polygonTokens),
};

type BaseTokenSymbols = keyof typeof baseTokensJSON;
type CommonBaseTokenSymbols = keyof typeof common.baseTokens;

export const baseTokens = {
  ...univ3.toTokenMap<BaseTokenSymbols>(baseTokensJSON),
  ...univ3.toTokenMap<CommonBaseTokenSymbols>(common.baseTokens),
};

type ArbitrumTokenSymbols = keyof typeof arbitrumTokensJSON;
type CommonArbitrumTokenSymbols = keyof typeof common.arbitrumTokens;

export const arbitrumTokens = {
  ...univ3.toTokenMap<ArbitrumTokenSymbols>(arbitrumTokensJSON),
  ...univ3.toTokenMap<CommonArbitrumTokenSymbols>(common.arbitrumTokens),
};

type AvalancheTokenSymbols = keyof typeof avalancheTokensJSON;
type CommonAvalancheTokenSymbols = keyof typeof common.avalancheTokens;

export const avalancheTokens = {
  ...univ3.toTokenMap<AvalancheTokenSymbols>(avalancheTokensJSON),
  ...univ3.toTokenMap<CommonAvalancheTokenSymbols>(common.avalancheTokens),
};

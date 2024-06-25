import arbitrumTokensJSON from './data/arbitrum.json';
import baseTokensJSON from './data/base.json';
import * as common from '@protocolink/common';
import mainnetTokensJSON from './data/mainnet.json';
import optimismTokensJSON from './data/optimism.json';
import polygonTokensJSON from './data/polygon.json';

type MainnetTokenSymbols = keyof typeof mainnetTokensJSON;

export const mainnetTokens = { ...common.toTokenMap<MainnetTokenSymbols>(mainnetTokensJSON), ...common.mainnetTokens };

type OptimismTokenSymbols = keyof typeof optimismTokensJSON;

export const optimismTokens = {
  ...common.toTokenMap<OptimismTokenSymbols>(optimismTokensJSON),
  ...common.optimismTokens,
};

type PolygonTokenSymbols = keyof typeof polygonTokensJSON;

export const polygonTokens = { ...common.toTokenMap<PolygonTokenSymbols>(polygonTokensJSON), ...common.polygonTokens };

type BaseTokenSymbols = keyof typeof baseTokensJSON;

export const baseTokens = { ...common.toTokenMap<BaseTokenSymbols>(baseTokensJSON), ...common.baseTokens };

type ArbitrumTokenSymbols = keyof typeof arbitrumTokensJSON;

export const arbitrumTokens = {
  ...common.toTokenMap<ArbitrumTokenSymbols>(arbitrumTokensJSON),
  ...common.arbitrumTokens,
};

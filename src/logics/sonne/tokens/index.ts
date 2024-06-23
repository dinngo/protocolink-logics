import * as common from '@protocolink/common';
import optimismTokensJSON from './data/optimism.json';

type OptimismTokenSymbols = keyof typeof optimismTokensJSON;

export const optimismTokens = {
  ...common.toTokenMap<OptimismTokenSymbols>(optimismTokensJSON),
  ...common.optimismTokens,
};

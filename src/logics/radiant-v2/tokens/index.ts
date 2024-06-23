import arbitrumTokensJSON from './data/arbitrum.json';
import * as common from '@protocolink/common';

type ArbitrumTokenSymbols = keyof typeof arbitrumTokensJSON;

export const arbitrumTokens = {
  ...common.toTokenMap<ArbitrumTokenSymbols>(arbitrumTokensJSON),
  ...common.arbitrumTokens,
};

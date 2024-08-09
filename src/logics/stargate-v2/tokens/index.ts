import * as common from '@protocolink/common';
import mainnetTokensJSON from './data/mainnet.json';
import metisTokensJSON from './data/metis.json';

type MainnetTokenSymbols = keyof typeof mainnetTokensJSON;

export const mainnetTokens = { ...common.toTokenMap<MainnetTokenSymbols>(mainnetTokensJSON) };

type MetisTokenSymbols = keyof typeof metisTokensJSON;

export const metisTokens = { ...common.toTokenMap<MetisTokenSymbols>(metisTokensJSON) };

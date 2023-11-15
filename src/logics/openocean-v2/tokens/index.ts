import * as common from '@protocolink/common';
import metisTokensJSON from './data/metis.json';

type MetisTokenSymbols = keyof typeof metisTokensJSON;

export const metisTokens = common.toTokenMap<MetisTokenSymbols>(metisTokensJSON);

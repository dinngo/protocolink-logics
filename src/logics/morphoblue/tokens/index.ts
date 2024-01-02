import * as common from '@protocolink/common';
import goerliTokensJSON from './data/goerli.json';

type GoerliTokenSymbols = keyof typeof goerliTokensJSON;

export const goerliTokens = common.toTokenMap<GoerliTokenSymbols>(goerliTokensJSON);

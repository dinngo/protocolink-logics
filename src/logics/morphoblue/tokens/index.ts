import * as common from '@protocolink/common';
import goerliTokensJSON from './data/goerli.json';
import mainnetTokensJSON from './data/mainnet.json';

type GoerliTokenSymbols = keyof typeof goerliTokensJSON;

export const goerliTokens = common.toTokenMap<GoerliTokenSymbols>(goerliTokensJSON);

type MainnetTokenSymbols = keyof typeof mainnetTokensJSON;

export const mainnetTokens = common.toTokenMap<MainnetTokenSymbols>(mainnetTokensJSON);

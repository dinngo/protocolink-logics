import * as core from 'src/core';
import mainnetJSON from './mainnet.json';

type MainnetTokenSymbols = keyof typeof mainnetJSON;

export const mainnet = core.tokens.toTokenMap<MainnetTokenSymbols>(mainnetJSON);

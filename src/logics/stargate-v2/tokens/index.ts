import bnbTokensJSON from './data/bnb.json';
import * as common from '@protocolink/common';
import mainnetTokensJSON from './data/mainnet.json';
import metisTokensJSON from './data/metis.json';
import polygonZkevmTokensJSON from './data/polygonZkevm.json';

type MainnetTokenSymbols = keyof typeof mainnetTokensJSON;

export const mainnetTokens = common.toTokenMap<MainnetTokenSymbols>(mainnetTokensJSON);

type BnbTokenSymbols = keyof typeof bnbTokensJSON;

export const bnbTokens = common.toTokenMap<BnbTokenSymbols>(bnbTokensJSON);

type MetisTokenSymbols = keyof typeof metisTokensJSON;

export const metisTokens = common.toTokenMap<MetisTokenSymbols>(metisTokensJSON);

type PolygonZkevmTokenSymbols = keyof typeof polygonZkevmTokensJSON;

export const polygonZkevmTokens = common.toTokenMap<PolygonZkevmTokenSymbols>(polygonZkevmTokensJSON);

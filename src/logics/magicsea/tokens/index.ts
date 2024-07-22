import * as common from '@protocolink/common';
import iotaTokensJSON from './data/iota.json';

type IotaTokenSymbols = keyof typeof iotaTokensJSON;

export const iotaTokens = { ...common.toTokenMap<IotaTokenSymbols>(iotaTokensJSON), ...common.iotaTokens };

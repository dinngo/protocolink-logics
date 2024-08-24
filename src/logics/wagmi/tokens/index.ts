import * as common from '@protocolink/common';
import iotaTokensJSON from './data/iota.json';
import * as univ3 from 'src/modules/univ3';

type IotaTokenSymbols = keyof typeof iotaTokensJSON;
type CommonIotaTokenSymbols = keyof typeof common.iotaTokens;

export const iotaTokens = {
  ...univ3.toTokenMap<IotaTokenSymbols>(iotaTokensJSON),
  ...univ3.toTokenMap<CommonIotaTokenSymbols>(common.iotaTokens),
};

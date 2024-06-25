import * as common from '@protocolink/common';
import zksyncTokensJSON from './data/zksync.json';

type ZksyncTokenSymbols = keyof typeof zksyncTokensJSON;

export const zksyncTokens = { ...common.toTokenMap<ZksyncTokenSymbols>(zksyncTokensJSON), ...common.zksyncTokens };

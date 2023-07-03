import * as common from '@protocolink/common';
import zksyncTokensJSON from './data/zksync.json';

export const zksyncTokens = common.toTokenMap<keyof typeof zksyncTokensJSON>(zksyncTokensJSON);

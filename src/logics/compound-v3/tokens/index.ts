import * as common from '@furucombo/composable-router-common';
import mainnetTokensJSON from './data/mainnet.json';
import polygonTokensJSON from './data/polygon.json';

type MainnetTokenSymbols = keyof typeof mainnetTokensJSON;

export const mainnetTokens = common.toTokenMap<MainnetTokenSymbols>(mainnetTokensJSON);

type PolygonTokenSymbols = keyof typeof polygonTokensJSON;

export const polygonTokens = common.toTokenMap<PolygonTokenSymbols>(polygonTokensJSON);

export const COMPMap: Record<number, common.Token> = {
  [common.ChainId.mainnet]: new common.Token(1, '0xc00e94Cb662C3520282E6f5717214004A7f26888', 18, 'COMP', 'Compound'),
  [common.ChainId.polygon]: new common.Token(
    137,
    '0x8505b9d2254A7Ae468c0E9dd10Ccea3A837aef5c',
    18,
    'COMP',
    '(PoS) Compound'
  ),
};

export function COMP(chainId: number) {
  return COMPMap[chainId];
}

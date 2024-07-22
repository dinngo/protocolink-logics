import * as common from '@protocolink/common';
import { iotaTokens } from './tokens';

type ContractNames = 'Factory' | 'Router';

export interface Config {
  chainId: number;
  contract: Record<ContractNames, string>;
  tokenListUrls: string[];
  bases: common.Token[];
}

export const configs: Config[] = [
  {
    chainId: common.ChainId.iota,
    contract: {
      Factory: '0x349aaAc3a500014981CBA11b64C76c66a6c1e8D0',
      Router: '0x531777F8c35fDe8DA9baB6cC7093A7D14a99D73E',
    },
    tokenListUrls: [
      'https://raw.githubusercontent.com/MagicSea-Finance/tokenlist/main/token.default.json',
      'https://raw.githubusercontent.com/moonpadxyz/tokenlist/main/token.default.json',
    ],
    bases: [common.iotaTokens.wIOTA, iotaTokens['USDC.e'], iotaTokens.USDT],
  },
];

export const [supportedChainIds, configMap] = configs.reduce(
  (accumulator, config) => {
    accumulator[0].push(config.chainId);
    accumulator[1][config.chainId] = config;
    return accumulator;
  },
  [[], {}] as [number[], Record<number, Config>]
);

export function getContractAddress(chainId: number, name: ContractNames) {
  return configMap[chainId].contract[name];
}

export function getTokenListUrls(chainId: number) {
  return configMap[chainId].tokenListUrls;
}

export function getBaseTokens(chainId: number) {
  return configMap[chainId].bases;
}

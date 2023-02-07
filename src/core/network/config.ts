import configsJSON from './config-data.json';
import * as tokens from '../tokens';

export interface NetworkConfig {
  id: string;
  chainId: number;
  name: string;
  explorerUrl: string;
  rpcUrl: string;
  nativeToken: tokens.Token;
  wrappedNativeToken: tokens.Token;
  multicall2Address: string;
}

export const [configs, configMap] = configsJSON.reduce(
  (accumulator, configJSON) => {
    const config: NetworkConfig = {
      id: configJSON.id,
      chainId: configJSON.chainId,
      name: configJSON.name,
      explorerUrl: configJSON.explorerUrl,
      rpcUrl: configJSON.rpcUrl,
      nativeToken: new tokens.Token(configJSON.nativeToken),
      wrappedNativeToken: new tokens.Token(configJSON.wrappedNativeToken),
      multicall2Address: configJSON.multicall2Address,
    };
    accumulator[0].push(config);
    accumulator[1][configJSON.chainId] = config;
    return accumulator;
  },
  [[] as NetworkConfig[], {} as Record<number, NetworkConfig>]
);

export function getConfig(chainId: number) {
  return configMap[chainId];
}

export function getNetworkId(chainId: number) {
  return getConfig(chainId).id;
}

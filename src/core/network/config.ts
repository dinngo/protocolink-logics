import configsJSON from './config-data.json';

export interface NetworkConfig {
  id: string;
  chainId: number;
  name: string;
  explorerUrl: string;
  rpcUrl: string;
  nativeToken: {
    chainId: number;
    address: string;
    decimals: number;
    symbol: string;
    name: string;
  };
  wrappedNativeToken: {
    chainId: number;
    address: string;
    decimals: number;
    symbol: string;
    name: string;
  };
  multicall2Address: string;
}

export const [configs, configMap] = configsJSON.reduce(
  (accumulator, config) => {
    accumulator[0].push(config);
    accumulator[1][config.chainId] = config;
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

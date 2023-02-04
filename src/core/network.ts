import * as tokens from './tokens';

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

export const configs: NetworkConfig[] = [
  {
    id: 'mainnet',
    chainId: 1,
    name: 'Ethereum',
    explorerUrl: 'https://etherscan.io/',
    rpcUrl: 'https://rpc.ankr.com/eth',
    nativeToken: tokens.mainnet.ETH,
    wrappedNativeToken: tokens.mainnet.WETH,
    multicall2Address: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
  },
];

export const configMap = configs.reduce((accumulator, network) => {
  accumulator[network.chainId] = network;
  return accumulator;
}, {} as Record<number, NetworkConfig>);

export function getConfig(chainId: number) {
  return configMap[chainId];
}

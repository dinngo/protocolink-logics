import { ETH_MAINNET, Token, WETH_MAINNET } from './tokens';

export interface NetworkConfig {
  id: string;
  chainId: number;
  name: string;
  explorerUrl: string;
  rpcUrl: string;
  nativeToken: Token;
  wrappedNativeToken: Token;
  multicall2Address: string;
}

export const networkConfigs: NetworkConfig[] = [
  {
    id: 'mainnet',
    chainId: 1,
    name: 'Ethereum',
    explorerUrl: 'https://etherscan.io/',
    rpcUrl: 'https://rpc.ankr.com/eth',
    nativeToken: ETH_MAINNET,
    wrappedNativeToken: WETH_MAINNET,
    multicall2Address: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
  },
];

export const networkConfigMap = networkConfigs.reduce((accumulator, network) => {
  accumulator[network.chainId] = network;
  return accumulator;
}, {} as Record<number, NetworkConfig>);

export function getNetworkConfig(chainId: number) {
  return networkConfigMap[chainId];
}

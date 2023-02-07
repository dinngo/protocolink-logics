import * as core from 'src/core';

export interface RouterConfig {
  routerAddress: string;
  erc20SpenderAddress: string;
}

export const configMap: Record<number, RouterConfig> = {
  [core.network.ChainId.mainnet]: {
    routerAddress: '0x6181667418c8FA0d4ae3Aa90532D55D3994121F3',
    erc20SpenderAddress: '0xaffD5c325d13FfbC714B10aEa27C1FBaCcf21a6a',
  },
};

export function getConfig(chainId: number) {
  return configMap[chainId];
}

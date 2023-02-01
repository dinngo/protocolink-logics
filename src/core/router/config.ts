export interface RouterConfig {
  router: string;
  erc20Spender: string;
}

export const routerConfigMap: Record<number, RouterConfig> = {
  1: {
    router: '0x6181667418c8FA0d4ae3Aa90532D55D3994121F3',
    erc20Spender: '0xaffD5c325d13FfbC714B10aEa27C1FBaCcf21a6a',
  },
};

export function getRouterConfig(chainId: number) {
  return routerConfigMap[chainId];
}

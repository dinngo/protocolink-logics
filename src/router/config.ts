import * as core from 'src/core';

type ContractNames = 'Router';

export const contractAddressMap: Record<number, { [k in ContractNames]: string }> = {
  [core.network.ChainId.mainnet]: {
    Router: '0x6181667418c8FA0d4ae3Aa90532D55D3994121F3',
  },
};

export function getContractAddress(chainId: number, name: ContractNames) {
  return contractAddressMap[chainId][name];
}

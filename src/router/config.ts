import * as core from 'src/core';

type ContractNames = 'Router' | 'SpenderERC20Approval' | 'SpenderAaveV2Delegation';

export const contractAddressMap: Record<number, { [k in ContractNames]: string }> = {
  [core.network.ChainId.mainnet]: {
    Router: '0x6181667418c8FA0d4ae3Aa90532D55D3994121F3',
    SpenderERC20Approval: '0xaffD5c325d13FfbC714B10aEa27C1FBaCcf21a6a',
    SpenderAaveV2Delegation: '0xBca6B15F3eFe0CEFc78ECC8100d0DA257c0c423F',
  },
};

export function getContractAddress(chainId: number, name: ContractNames) {
  return contractAddressMap[chainId][name];
}

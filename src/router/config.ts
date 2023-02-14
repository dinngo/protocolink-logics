import * as core from 'src/core';

type ContractNames =
  | 'Router'
  | 'SpenderERC20Approval'
  | 'SpenderPermit2ERC20'
  | 'SpenderAaveV2Delegation'
  | 'FlashLoanCallbackAaveV2';

export const contractAddressMap: Record<number, { [k in ContractNames]: string }> = {
  [core.network.ChainId.mainnet]: {
    Router: '0x6181667418c8FA0d4ae3Aa90532D55D3994121F3',
    SpenderERC20Approval: '0xaffD5c325d13FfbC714B10aEa27C1FBaCcf21a6a',
    SpenderPermit2ERC20: '0x6a68033b6E03dB8E2bB970245c87E934d45E1Cd0',
    SpenderAaveV2Delegation: '0xBca6B15F3eFe0CEFc78ECC8100d0DA257c0c423F',
    FlashLoanCallbackAaveV2: '0xcfaa4D5C152Ac3DAc3e2feAAC9Cd70709f350982',
  },
};

export function getContractAddress(chainId: number, name: ContractNames) {
  return contractAddressMap[chainId][name];
}

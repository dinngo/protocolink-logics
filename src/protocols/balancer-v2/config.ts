import * as core from 'src/core';

type ContractNames = 'Vault' | 'FlashLoanCallbackBalancerV2';

export const contractAddressMap: Record<number, { [k in ContractNames]: string }> = {
  [core.network.ChainId.mainnet]: {
    Vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    FlashLoanCallbackBalancerV2: '0x3AC9d552Dab7b2FF2980F59C6735CAB9F1fF4136',
  },
};

export function getContractAddress(chainId: number, name: ContractNames) {
  return contractAddressMap[chainId][name];
}

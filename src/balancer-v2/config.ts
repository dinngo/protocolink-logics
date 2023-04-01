import * as common from '@composable-router/common';

type ContractNames = 'Vault' | 'FlashLoanCallbackBalancerV2';

// TODO: update after FlashLoanCallbackBalancerV2 deployed
export const contractAddressMap: Record<number, { [k in ContractNames]: string }> = {
  [common.ChainId.mainnet]: {
    Vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    FlashLoanCallbackBalancerV2: '0x3AC9d552Dab7b2FF2980F59C6735CAB9F1fF4136',
  },
  [common.ChainId.polygon]: {
    Vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    FlashLoanCallbackBalancerV2: '',
  },
  [common.ChainId.arbitrum]: {
    Vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    FlashLoanCallbackBalancerV2: '',
  },
  [common.ChainId.optimism]: {
    Vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    FlashLoanCallbackBalancerV2: '',
  },
};

export function getContractAddress(chainId: number, name: ContractNames) {
  return contractAddressMap[chainId][name];
}

export function setContractAddress(chainId: number, name: ContractNames, address: string) {
  contractAddressMap[chainId][name] = address;
}

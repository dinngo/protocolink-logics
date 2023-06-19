import * as common from '@furucombo/composable-router-common';

type ContractNames = 'Vault' | 'BalancerV2FlashLoanCallback';

// TODO: update after BalancerV2FlashLoanCallback deployed
export const contractAddressMap: Record<number, { [k in ContractNames]: string }> = {
  [common.ChainId.mainnet]: {
    Vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    BalancerV2FlashLoanCallback: '0x6b0C384B0495f8f5d713091a0185E182298eE74A',
  },
  [common.ChainId.polygon]: {
    Vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    BalancerV2FlashLoanCallback: '',
  },
  [common.ChainId.arbitrum]: {
    Vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    BalancerV2FlashLoanCallback: '',
  },
  [common.ChainId.optimism]: {
    Vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    BalancerV2FlashLoanCallback: '',
  },
};

export function getContractAddress(chainId: number, name: ContractNames) {
  return contractAddressMap[chainId][name];
}

export function setContractAddress(chainId: number, name: ContractNames, address: string) {
  contractAddressMap[chainId][name] = address;
}

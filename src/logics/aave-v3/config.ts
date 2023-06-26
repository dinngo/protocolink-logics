import * as common from '@protocolink/common';

type ContractNames = 'PoolDataProvider' | 'AaveV3FlashLoanCallback';

// TODO: update after AaveV3FlashLoanCallback deployed
export const contractAddressMap: Record<number, { [k in ContractNames]: string }> = {
  [common.ChainId.mainnet]: {
    PoolDataProvider: '0x7B4EB56E7CD4b454BA8ff71E4518426369a138a3',
    AaveV3FlashLoanCallback: '0x8400b485e75443806F62A1069AFd8390192dEE4a',
  },
  [common.ChainId.polygon]: {
    PoolDataProvider: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
    AaveV3FlashLoanCallback: '',
  },
  [common.ChainId.arbitrum]: {
    PoolDataProvider: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
    AaveV3FlashLoanCallback: '',
  },
  [common.ChainId.optimism]: {
    PoolDataProvider: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
    AaveV3FlashLoanCallback: '',
  },
  [common.ChainId.avalanche]: {
    PoolDataProvider: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
    AaveV3FlashLoanCallback: '',
  },
};

export function getContractAddress(chainId: number, name: ContractNames) {
  return contractAddressMap[chainId][name];
}

export function setContractAddress(chainId: number, name: ContractNames, address: string) {
  contractAddressMap[chainId][name] = address;
}

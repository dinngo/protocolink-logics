import * as common from '@composable-router/common';

type ContractNames = 'PoolDataProvider' | 'FlashLoanCallbackAaveV3';

// TODO: update after FlashLoanCallbackAaveV3 deployed
export const contractAddressMap: Record<number, { [k in ContractNames]: string }> = {
  [common.ChainId.mainnet]: {
    PoolDataProvider: '0x7B4EB56E7CD4b454BA8ff71E4518426369a138a3',
    FlashLoanCallbackAaveV3: '0xcfaa4D5C152Ac3DAc3e2feAAC9Cd70709f350982',
  },
  [common.ChainId.polygon]: {
    PoolDataProvider: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
    FlashLoanCallbackAaveV3: '',
  },
  [common.ChainId.avalanche]: {
    PoolDataProvider: '0x69fa688f1dc47d4b5d8029d5a35fb7a548310654',
    FlashLoanCallbackAaveV3: '',
  },
};

export function getContractAddress(chainId: number, name: ContractNames) {
  return contractAddressMap[chainId][name];
}

export function setContractAddress(chainId: number, name: ContractNames, address: string) {
  contractAddressMap[chainId][name] = address;
}

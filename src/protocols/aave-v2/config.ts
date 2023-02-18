import * as common from '@composable-router/common';

type ContractNames = 'ProtocolDataProvider' | 'SpenderAaveV2Delegation' | 'FlashLoanCallbackAaveV2';

// TODO: update after SpenderAaveV2Delegation, FlashLoanCallbackAaveV2 deployed
export const contractAddressMap: Record<number, { [k in ContractNames]: string }> = {
  [common.ChainId.mainnet]: {
    ProtocolDataProvider: '0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d',
    SpenderAaveV2Delegation: '0xBca6B15F3eFe0CEFc78ECC8100d0DA257c0c423F',
    FlashLoanCallbackAaveV2: '0xcfaa4D5C152Ac3DAc3e2feAAC9Cd70709f350982',
  },
  [common.ChainId.polygon]: {
    ProtocolDataProvider: '0x7551b5D2763519d4e37e8B81929D336De671d46d',
    SpenderAaveV2Delegation: '',
    FlashLoanCallbackAaveV2: '',
  },
  [common.ChainId.avalanche]: {
    ProtocolDataProvider: '0x65285E9dfab318f57051ab2b139ccCf232945451',
    SpenderAaveV2Delegation: '',
    FlashLoanCallbackAaveV2: '',
  },
};

export function getContractAddress(chainId: number, name: ContractNames) {
  return contractAddressMap[chainId][name];
}

export function setContractAddress(chainId: number, name: ContractNames, address: string) {
  contractAddressMap[chainId][name] = address;
}

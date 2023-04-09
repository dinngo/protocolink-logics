import * as common from '@furucombo/composable-router-common';

type ContractNames = 'ProtocolDataProvider' | 'FlashLoanCallbackAaveV2';

// TODO: update after FlashLoanCallbackAaveV2 deployed
export const contractAddressMap: Record<number, { [k in ContractNames]: string }> = {
  [common.ChainId.mainnet]: {
    ProtocolDataProvider: '0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d',
    FlashLoanCallbackAaveV2: '0x1aAb5e8217042f5f4988Fc808A054924006957B9',
  },
  [common.ChainId.polygon]: {
    ProtocolDataProvider: '0x7551b5D2763519d4e37e8B81929D336De671d46d',
    FlashLoanCallbackAaveV2: '',
  },
  [common.ChainId.avalanche]: {
    ProtocolDataProvider: '0x65285E9dfab318f57051ab2b139ccCf232945451',
    FlashLoanCallbackAaveV2: '',
  },
};

export function getContractAddress(chainId: number, name: ContractNames) {
  return contractAddressMap[chainId][name];
}

export function setContractAddress(chainId: number, name: ContractNames, address: string) {
  contractAddressMap[chainId][name] = address;
}

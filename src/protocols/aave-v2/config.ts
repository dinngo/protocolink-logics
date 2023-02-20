import * as core from 'src/core';

type ContractNames = 'ProtocolDataProvider' | 'SpenderAaveV2Delegation' | 'FlashLoanCallbackAaveV2';

export const contractAddressMap: Record<number, { [k in ContractNames]: string }> = {
  [core.network.ChainId.mainnet]: {
    ProtocolDataProvider: '0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d',
    SpenderAaveV2Delegation: '0xBca6B15F3eFe0CEFc78ECC8100d0DA257c0c423F',
    FlashLoanCallbackAaveV2: '0xcfaa4D5C152Ac3DAc3e2feAAC9Cd70709f350982',
  },
};

export function getContractAddress(chainId: number, name: ContractNames) {
  return contractAddressMap[chainId][name];
}

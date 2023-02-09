import * as core from 'src/core';

type ContractNames = 'ProtocolDataProvider';

export const contractAddressMap: Record<number, { [k in ContractNames]: string }> = {
  [core.network.ChainId.mainnet]: {
    ProtocolDataProvider: '0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d',
  },
};

export function getContractAddress(chainId: number, name: ContractNames) {
  return contractAddressMap[chainId][name];
}

import * as core from 'src/core';

type ContractNames = 'ProtocolDataProvider' | 'WETHGateway';

export const contractAddressMap: Record<number, { [k in ContractNames]: string }> = {
  [core.network.ChainId.mainnet]: {
    ProtocolDataProvider: '0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d',
    WETHGateway: '0xEFFC18fC3b7eb8E676dac549E0c693ad50D1Ce31',
  },
};

export function getContractAddress(chainId: number, name: ContractNames) {
  return contractAddressMap[chainId][name];
}

import * as core from 'src/core';

type ContractNames = 'TokenTransferProxy';

export const contractAddressMap: Record<number, { [k in ContractNames]: string }> = {
  [core.network.ChainId.mainnet]: {
    TokenTransferProxy: '0x216B4B4Ba9F3e719726886d34a177484278Bfcae',
  },
};

export function getContractAddress(chainId: number, name: ContractNames) {
  return contractAddressMap[chainId][name];
}

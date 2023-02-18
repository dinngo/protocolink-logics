import * as common from '@composable-router/common';

type ContractNames = 'TokenTransferProxy';

export const contractAddressMap: Record<number, { [k in ContractNames]: string }> = {
  [common.ChainId.mainnet]: {
    TokenTransferProxy: '0x216B4B4Ba9F3e719726886d34a177484278Bfcae',
  },
  [common.ChainId.polygon]: {
    TokenTransferProxy: '0x216B4B4Ba9F3e719726886d34a177484278Bfcae',
  },
  [common.ChainId.arbitrum]: {
    TokenTransferProxy: '0x216B4B4Ba9F3e719726886d34a177484278Bfcae',
  },
  [common.ChainId.optimism]: {
    TokenTransferProxy: '0x216B4B4Ba9F3e719726886d34a177484278Bfcae',
  },
  [common.ChainId.avalanche]: {
    TokenTransferProxy: '0x216B4B4Ba9F3e719726886d34a177484278Bfcae',
  },
};

export function getContractAddress(chainId: number, name: ContractNames) {
  return contractAddressMap[chainId][name];
}

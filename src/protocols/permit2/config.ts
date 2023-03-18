import * as common from '@composable-router/common';

type ContractNames = 'Permit2';

export const contractAddressMap: Record<number, { [k in ContractNames]: string }> = {
  [common.ChainId.mainnet]: {
    Permit2: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
  },
  [common.ChainId.polygon]: {
    Permit2: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
  },
  [common.ChainId.arbitrum]: {
    Permit2: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
  },
  [common.ChainId.optimism]: {
    Permit2: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
  },
  [common.ChainId.avalanche]: {
    // TODO: uniswap don't deploy permit2 in avalanche
    Permit2: '',
  },
};

export function getContractAddress(chainId: number, name: ContractNames) {
  return contractAddressMap[chainId][name];
}

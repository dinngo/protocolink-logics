import * as common from '@composable-router/common';

type ContractNames = 'Permit2' | 'SpenderPermit2ERC20';

// TODO: update after SpenderPermit2ERC20 deployed
export const contractAddressMap: Record<number, { [k in ContractNames]: string }> = {
  [common.ChainId.mainnet]: {
    Permit2: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
    SpenderPermit2ERC20: '0x6a68033b6E03dB8E2bB970245c87E934d45E1Cd0',
  },
  [common.ChainId.polygon]: {
    Permit2: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
    SpenderPermit2ERC20: '',
  },
  [common.ChainId.arbitrum]: {
    Permit2: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
    SpenderPermit2ERC20: '',
  },
  [common.ChainId.optimism]: {
    Permit2: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
    SpenderPermit2ERC20: '',
  },
  [common.ChainId.avalanche]: {
    // TODO: uniswap don't deploy permit2 in avalanche
    Permit2: '',
    SpenderPermit2ERC20: '',
  },
};

export function getContractAddress(chainId: number, name: ContractNames) {
  return contractAddressMap[chainId][name];
}

export function setContractAddress(chainId: number, name: ContractNames, address: string) {
  contractAddressMap[chainId][name] = address;
}

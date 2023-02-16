import * as core from 'src/core';

type ContractNames = 'Permit2' | 'SpenderPermit2ERC20';

export const contractAddressMap: Record<number, { [k in ContractNames]: string }> = {
  [core.network.ChainId.mainnet]: {
    Permit2: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
    SpenderPermit2ERC20: '0x6a68033b6E03dB8E2bB970245c87E934d45E1Cd0',
  },
};

export function getContractAddress(chainId: number, name: ContractNames) {
  return contractAddressMap[chainId][name];
}

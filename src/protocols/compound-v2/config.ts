import * as core from 'src/core';

type ContractNames = 'CompoundLens' | 'Comptroller';

export const contractAddressMap: Record<number, { [k in ContractNames]: string }> = {
  [core.network.ChainId.mainnet]: {
    Comptroller: '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B',
    CompoundLens: '0xdCbDb7306c6Ff46f77B349188dC18cEd9DF30299',
  },
};

export function getContractAddress(chainId: number, name: ContractNames) {
  return contractAddressMap[chainId][name];
}

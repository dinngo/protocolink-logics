export const contractAddressMap = {
  Comptroller: '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B',
  CompoundLens: '0xdCbDb7306c6Ff46f77B349188dC18cEd9DF30299',
};

type ContractNames = keyof typeof contractAddressMap;

export function getContractAddress(name: ContractNames) {
  return contractAddressMap[name];
}

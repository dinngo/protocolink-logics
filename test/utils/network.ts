import hre from 'hardhat';

export async function reset(): Promise<void> {
  await hre.network.provider.request({ method: 'hardhat_reset', params: [] });
}

export async function getChainId() {
  const network = await hre.ethers.getDefaultProvider().getNetwork();
  return network.chainId;
}

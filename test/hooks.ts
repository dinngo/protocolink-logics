import * as core from '@protocolink/core';
import { getChainId } from '@protocolink/test-helpers';
import * as helpers from '@nomicfoundation/hardhat-network-helpers';

export async function setup() {
  const hre = await import('hardhat');
  const chainId = await getChainId();

  const router = core.Router__factory.connect(core.getContractAddress(chainId, 'Router'), hre.ethers.provider);
  const ownerAddress = await router.owner();
  await helpers.impersonateAccount(ownerAddress);
  const owner = hre.ethers.provider.getSigner(ownerAddress);
  await router.connect(owner).setFeeRate(0);
}

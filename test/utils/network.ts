import { HardhatNetworkConfig } from 'hardhat/types';
import hre from 'hardhat';

export async function reset(): Promise<void> {
  await hre.network.provider.request({
    method: 'hardhat_reset',
    params: [{ forking: { jsonRpcUrl: (hre.network.config as HardhatNetworkConfig).forking?.url } }],
  });
}

export async function getChainId() {
  const network = await hre.ethers.getDefaultProvider().getNetwork();
  return network.chainId;
}

export async function takeSnapshot(): Promise<string> {
  return await hre.network.provider.send('evm_snapshot', []);
}

export async function restoreSnapshot(id: string) {
  await hre.network.provider.send('evm_revert', [id]);
}

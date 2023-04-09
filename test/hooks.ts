import * as aavev2 from 'src/aave-v2';
import * as aavev3 from 'src/aave-v3';
import * as balancerv2 from 'src/balancer-v2';
import * as common from '@furucombo/composable-router-common';
import * as core from '@furucombo/composable-router-core';
import { getChainId } from '@furucombo/composable-router-test-helpers';

export async function setup() {
  const hre = await import('hardhat');
  const [deployer] = await hre.ethers.getSigners();
  const chainId = await getChainId();

  // deploy Router
  const router = await (
    await new core.Router__factory()
      .connect(deployer)
      .deploy(common.getWrappedNativeToken(chainId).address, deployer.address, deployer.address)
  ).deployed();
  core.setContractAddress(chainId, 'Router', router.address);
  const agentImplementation = await router.agentImplementation();
  core.setContractAddress(chainId, 'AgentImplementation', agentImplementation);

  // deploy FlashLoanCallbackAaveV2
  const aaveV2Service = new aavev2.Service(chainId, hre.ethers.provider);
  const aaveV2AddressesProvider = await aaveV2Service.protocolDataProvider.ADDRESSES_PROVIDER();
  const flashLoanCallbackAaveV2 = await (
    await new aavev2.FlashLoanCallbackAaveV2__factory()
      .connect(deployer)
      .deploy(router.address, aaveV2AddressesProvider)
  ).deployed();
  aavev2.setContractAddress(chainId, 'FlashLoanCallbackAaveV2', flashLoanCallbackAaveV2.address);

  // deploy FlashLoanCallbackAaveV3
  const aaveV3Service = new aavev3.Service(chainId, hre.ethers.provider);
  const aaveV3AddressesProvider = await aaveV3Service.poolDataProvider.ADDRESSES_PROVIDER();
  const flashLoanCallbackAaveV3 = await (
    await new aavev3.FlashLoanCallbackAaveV3__factory()
      .connect(deployer)
      .deploy(router.address, aaveV3AddressesProvider)
  ).deployed();
  aavev3.setContractAddress(chainId, 'FlashLoanCallbackAaveV3', flashLoanCallbackAaveV3.address);

  // deploy FlashLoanCallbackBalancerV2
  const flashLoanCallbackBalancerV2 = await (
    await new balancerv2.FlashLoanCallbackBalancerV2__factory()
      .connect(deployer)
      .deploy(router.address, balancerv2.getContractAddress(chainId, 'Vault'))
  ).deployed();
  balancerv2.setContractAddress(chainId, 'FlashLoanCallbackBalancerV2', flashLoanCallbackBalancerV2.address);
}

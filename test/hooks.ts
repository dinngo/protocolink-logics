import * as core from '@composable-router/core';
import { getChainId } from '@composable-router/test-helpers';
import * as protocols from 'src/protocols';

export async function deployContracts() {
  const hre = await import('hardhat');
  const [deployer] = await hre.ethers.getSigners();
  const chainId = await getChainId();

  // deploy Router
  const router = await (await new core.Router__factory().connect(deployer).deploy()).deployed();
  core.setContractAddress(chainId, 'Router', router.address);

  // deploy SpenderPermit2ERC20
  const spenderPermit2ERC20 = await (
    await new protocols.router.SpenderPermit2ERC20__factory()
      .connect(deployer)
      .deploy(core.getContractAddress(chainId, 'Router'), protocols.router.getContractAddress(chainId, 'Permit2'))
  ).deployed();
  protocols.router.setContractAddress(chainId, 'SpenderPermit2ERC20', spenderPermit2ERC20.address);

  // deploy SpenderAaveV2Delegation, FlashLoanCallbackAaveV2
  const aaveV2Service = new protocols.aavev2.Service(chainId, hre.ethers.provider);
  const addressesProvider = await aaveV2Service.protocolDataProvider.ADDRESSES_PROVIDER();

  const spenderAaveV2Delegation = await (
    await new protocols.aavev2.SpenderAaveV2Delegation__factory()
      .connect(deployer)
      .deploy(core.getContractAddress(chainId, 'Router'), addressesProvider)
  ).deployed();
  protocols.aavev2.setContractAddress(chainId, 'SpenderAaveV2Delegation', spenderAaveV2Delegation.address);

  const flashLoanCallbackAaveV2 = await (
    await new protocols.aavev2.FlashLoanCallbackAaveV2__factory()
      .connect(deployer)
      .deploy(core.getContractAddress(chainId, 'Router'), addressesProvider)
  ).deployed();
  protocols.aavev2.setContractAddress(chainId, 'FlashLoanCallbackAaveV2', flashLoanCallbackAaveV2.address);

  // deploy FlashLoanCallbackBalancerV2
  const flashLoanCallbackBalancerV2 = await (
    await new protocols.balancerv2.FlashLoanCallbackBalancerV2__factory()
      .connect(deployer)
      .deploy(core.getContractAddress(chainId, 'Router'), protocols.balancerv2.getContractAddress(chainId, 'Vault'))
  ).deployed();
  protocols.balancerv2.setContractAddress(chainId, 'FlashLoanCallbackBalancerV2', flashLoanCallbackBalancerV2.address);
}

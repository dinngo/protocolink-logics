import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import hre from 'hardhat';
import * as protocols from 'src/protocols';
import * as rt from 'src/router';

export async function deployRouter(owner?: SignerWithAddress) {
  if (!owner) [owner] = await hre.ethers.getSigners();
  return await (await new rt.contracts.Router__factory().connect(owner).deploy()).deployed();
}

export async function deploySpenderPermit2ERC20(router: string, permit2: string, owner?: SignerWithAddress) {
  if (!owner) [owner] = await hre.ethers.getSigners();
  return await (
    await new protocols.router.contracts.SpenderPermit2ERC20__factory().connect(owner).deploy(router, permit2)
  ).deployed();
}

export async function deploySpenderAaveV2Delegation(router: string, aaveV2Provider: string, owner?: SignerWithAddress) {
  if (!owner) [owner] = await hre.ethers.getSigners();
  return await (
    await new protocols.aavev2.contracts.SpenderAaveV2Delegation__factory()
      .connect(owner)
      .deploy(router, aaveV2Provider)
  ).deployed();
}

export async function deployFlashLoanCallbackAaveV2(router: string, aaveV2Provider: string, owner?: SignerWithAddress) {
  if (!owner) [owner] = await hre.ethers.getSigners();
  return await (
    await new protocols.aavev2.contracts.FlashLoanCallbackAaveV2__factory()
      .connect(owner)
      .deploy(router, aaveV2Provider)
  ).deployed();
}

export async function deployFlashLoanCallbackBalancerV2(router: string, vault: string, owner?: SignerWithAddress) {
  if (!owner) [owner] = await hre.ethers.getSigners();
  return await (
    await new protocols.balancerv2.contracts.FlashLoanCallbackBalancerV2__factory().connect(owner).deploy(router, vault)
  ).deployed();
}

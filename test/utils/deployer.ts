import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import hre from 'hardhat';
import * as rt from 'src/router';

export async function deployRouter(owner?: SignerWithAddress) {
  if (!owner) [owner] = await hre.ethers.getSigners();
  return await (await new rt.contracts.Router__factory().connect(owner).deploy()).deployed();
}

export async function deploySpenderERC20Approval(router: string, owner?: SignerWithAddress) {
  if (!owner) [owner] = await hre.ethers.getSigners();
  return await (await new rt.contracts.SpenderERC20Approval__factory().connect(owner).deploy(router)).deployed();
}

export async function deploySpenderAaveV2Delegation(router: string, aaveV2Provider: string, owner?: SignerWithAddress) {
  if (!owner) [owner] = await hre.ethers.getSigners();
  return await (
    await new rt.contracts.SpenderAaveV2Delegation__factory().connect(owner).deploy(router, aaveV2Provider)
  ).deployed();
}

export async function deployFlashLoanCallbackAaveV2(router: string, aaveV2Provider: string, owner?: SignerWithAddress) {
  if (!owner) [owner] = await hre.ethers.getSigners();
  return await (
    await new rt.contracts.FlashLoanCallbackAaveV2__factory().connect(owner).deploy(router, aaveV2Provider)
  ).deployed();
}

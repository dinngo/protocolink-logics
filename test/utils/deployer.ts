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

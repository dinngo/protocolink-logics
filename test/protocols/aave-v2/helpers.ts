import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { approve } from '@composable-router/test-helpers';
import * as common from '@composable-router/common';
import { expect } from 'chai';
import hre from 'hardhat';
import * as protocols from 'src/protocols';

export async function deposit(chainId: number, user: SignerWithAddress, assetAmount: common.TokenAmount) {
  const aaveV2Service = new protocols.aavev2.Service(chainId, hre.ethers.provider);
  const lendingPoolAddress = await aaveV2Service.getLendingPoolAddress();
  await approve(user, lendingPoolAddress, assetAmount);
  const lendingPool = protocols.aavev2.LendingPool__factory.connect(lendingPoolAddress, user);
  await expect(lendingPool.deposit(assetAmount.token.address, assetAmount.amountWei, user.address, 0)).not.to.be
    .reverted;
}

export async function approveDelegation(
  chainId: number,
  user: SignerWithAddress,
  assetAmount: common.TokenAmount,
  interestRateMode: protocols.aavev2.InterestRateMode
) {
  const delegateeAddress = protocols.aavev2.getContractAddress(chainId, 'SpenderAaveV2Delegation');

  const aaveV2Service = new protocols.aavev2.Service(chainId, hre.ethers.provider);
  const isDelegationApproved = await aaveV2Service.isDelegationApproved(
    user.address,
    delegateeAddress,
    assetAmount,
    interestRateMode
  );
  if (!isDelegationApproved) {
    const tx = await aaveV2Service.buildApproveDelegationTransactionRequest(
      delegateeAddress,
      assetAmount,
      interestRateMode
    );
    await expect(user.sendTransaction(tx)).not.to.be.reverted;
  }
}

export async function borrow(
  chainId: number,
  user: SignerWithAddress,
  assetAmount: common.TokenAmount,
  interestRateMode: protocols.aavev2.InterestRateMode
) {
  const aaveV2Service = new protocols.aavev2.Service(chainId, hre.ethers.provider);
  const lendingPoolAddress = await aaveV2Service.getLendingPoolAddress();
  await approve(user, lendingPoolAddress, assetAmount);
  const lendingPool = protocols.aavev2.LendingPool__factory.connect(lendingPoolAddress, user);
  await expect(lendingPool.borrow(assetAmount.token.address, assetAmount.amountWei, interestRateMode, 0, user.address))
    .not.to.be.reverted;
}

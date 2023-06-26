import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as aavev2 from 'src/logics/aave-v2';
import { approve } from '@furucombo/composable-router-test-helpers';
import * as common from '@furucombo/composable-router-common';
import * as core from '@furucombo/composable-router-core';
import { expect } from 'chai';
import hre from 'hardhat';

export async function deposit(chainId: number, user: SignerWithAddress, assetAmount: common.TokenAmount) {
  assetAmount = new common.TokenAmount(assetAmount.token.wrapped, assetAmount.amount);

  const service = new aavev2.Service(chainId, hre.ethers.provider);
  const lendingPoolAddress = await service.getLendingPoolAddress();
  await approve(user, lendingPoolAddress, assetAmount);
  await expect(
    aavev2.LendingPool__factory.connect(lendingPoolAddress, user).deposit(
      assetAmount.token.address,
      assetAmount.amountWei,
      user.address,
      0
    )
  ).to.not.be.reverted;
}

export async function approveDelegation(
  chainId: number,
  user: SignerWithAddress,
  assetAmount: common.TokenAmount,
  interestRateMode: aavev2.InterestRateMode
) {
  const userAgent = core.calcAccountAgent(chainId, user.address);

  const service = new aavev2.Service(chainId, hre.ethers.provider);
  const isDelegationApproved = await service.isDelegationApproved(
    user.address,
    userAgent,
    assetAmount,
    interestRateMode
  );
  if (!isDelegationApproved) {
    const tx = await service.buildApproveDelegationTransactionRequest(userAgent, assetAmount, interestRateMode);
    await expect(user.sendTransaction(tx)).to.not.be.reverted;
  }
}

export async function borrow(
  chainId: number,
  user: SignerWithAddress,
  assetAmount: common.TokenAmount,
  interestRateMode: aavev2.InterestRateMode
) {
  if (assetAmount.token.isNative) {
    const wrappedToken = assetAmount.token.wrapped;
    await expect(common.WETH__factory.connect(wrappedToken.address, user).deposit({ value: assetAmount.amountWei })).to
      .not.be.reverted;
    assetAmount = new common.TokenAmount(wrappedToken, assetAmount.amount);
  }

  const service = new aavev2.Service(chainId, hre.ethers.provider);
  const lendingPoolAddress = await service.getLendingPoolAddress();
  await approve(user, lendingPoolAddress, assetAmount);
  await expect(
    aavev2.LendingPool__factory.connect(lendingPoolAddress, user).borrow(
      assetAmount.token.address,
      assetAmount.amountWei,
      interestRateMode,
      0,
      user.address
    )
  ).to.not.be.reverted;
}

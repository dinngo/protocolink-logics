import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { approve } from '@composable-router/test-helpers';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as protocols from 'src/protocols';

export async function deposit(chainId: number, user: SignerWithAddress, assetAmount: common.TokenAmount) {
  assetAmount = new common.TokenAmount(assetAmount.token.wrapped, assetAmount.amount);

  const aaveV2Service = new protocols.aavev2.Service(chainId, hre.ethers.provider);
  const lendingPoolAddress = await aaveV2Service.getLendingPoolAddress();
  await approve(user, lendingPoolAddress, assetAmount);
  const lendingPool = protocols.aavev2.LendingPool__factory.connect(lendingPoolAddress, user);
  await expect(lendingPool.deposit(assetAmount.token.address, assetAmount.amountWei, user.address, 0)).to.not.be
    .reverted;
}

export async function approveDelegation(
  chainId: number,
  user: SignerWithAddress,
  assetAmount: common.TokenAmount,
  interestRateMode: protocols.aavev2.InterestRateMode
) {
  const userAgent = core.calcAccountAgent(chainId, user.address);

  const aaveV2Service = new protocols.aavev2.Service(chainId, hre.ethers.provider);
  const isDelegationApproved = await aaveV2Service.isDelegationApproved(
    user.address,
    userAgent,
    assetAmount,
    interestRateMode
  );
  if (!isDelegationApproved) {
    const tx = await aaveV2Service.buildApproveDelegationTransactionRequest(userAgent, assetAmount, interestRateMode);
    await expect(user.sendTransaction(tx)).to.not.be.reverted;
  }
}

export async function borrow(
  chainId: number,
  user: SignerWithAddress,
  assetAmount: common.TokenAmount,
  interestRateMode: protocols.aavev2.InterestRateMode
) {
  if (assetAmount.token.isNative) {
    const wrappedToken = assetAmount.token.wrapped;
    const contractWETH = common.WETH__factory.connect(wrappedToken.address, user);
    await expect(contractWETH.deposit({ value: assetAmount.amountWei })).to.not.be.reverted;
    assetAmount = new common.TokenAmount(wrappedToken, assetAmount.amount);
  }

  const aaveV2Service = new protocols.aavev2.Service(chainId, hre.ethers.provider);
  const lendingPoolAddress = await aaveV2Service.getLendingPoolAddress();
  await approve(user, lendingPoolAddress, assetAmount);
  const lendingPool = protocols.aavev2.LendingPool__factory.connect(lendingPoolAddress, user);
  await expect(lendingPool.borrow(assetAmount.token.address, assetAmount.amountWei, interestRateMode, 0, user.address))
    .to.not.be.reverted;
}

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as core from 'src/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as protocols from 'src/protocols';
import * as utils from 'test/utils';

export async function deposit(chainId: number, user: SignerWithAddress, assetAmount: core.tokens.TokenAmount) {
  const aaveV2Service = new protocols.aavev2.AaveV2Service({ chainId, provider: hre.ethers.provider });
  const lendingPoolAddress = await aaveV2Service.getLendingPoolAddress();
  if (assetAmount.token.isNative()) {
    const wethGatewayAddress = await aaveV2Service.getWETHGatewayAddress();
    const wethGateway = protocols.aavev2.contracts.WETHGateway__factory.connect(wethGatewayAddress, user);
    await expect(wethGateway.depositETH(lendingPoolAddress, user.address, 0, { value: assetAmount.amountWei })).not.to
      .be.reverted;
  } else {
    await utils.web3.approve(user, lendingPoolAddress, assetAmount);
    const lendingPool = protocols.aavev2.contracts.LendingPool__factory.connect(lendingPoolAddress, user);
    await expect(lendingPool.deposit(assetAmount.token.address, assetAmount.amountWei, user.address, 0)).not.to.be
      .reverted;
  }
}

export async function approveDelegation(
  chainId: number,
  user: SignerWithAddress,
  delegateeAddress: string,
  assetAmount: core.tokens.TokenAmount,
  interestRateMode: protocols.aavev2.InterestRateMode
) {
  const aaveV2Service = new protocols.aavev2.AaveV2Service({ chainId, provider: hre.ethers.provider });
  const isDelegationApproved = await aaveV2Service.isDelegationApproved(
    user.address,
    delegateeAddress,
    assetAmount,
    interestRateMode
  );
  if (!isDelegationApproved) {
    const tx = await aaveV2Service.buildApproveDelegationTx(delegateeAddress, assetAmount, interestRateMode);
    await expect(user.sendTransaction(tx)).not.to.be.reverted;
  }
}

export async function borrow(
  chainId: number,
  user: SignerWithAddress,
  assetAmount: core.tokens.TokenAmount,
  interestRateMode: protocols.aavev2.InterestRateMode
) {
  const aaveV2Service = new protocols.aavev2.AaveV2Service({ chainId, provider: hre.ethers.provider });
  const lendingPoolAddress = await aaveV2Service.getLendingPoolAddress();
  if (assetAmount.token.isNative()) {
    const wethGatewayAddress = await aaveV2Service.getWETHGatewayAddress();
    const tx = await aaveV2Service.buildApproveDelegationTx(wethGatewayAddress, assetAmount, interestRateMode);
    await expect(user.sendTransaction(tx)).not.to.be.reverted;
    const wethGateway = protocols.aavev2.contracts.WETHGateway__factory.connect(wethGatewayAddress, user);
    await expect(wethGateway.borrowETH(lendingPoolAddress, assetAmount.amountWei, interestRateMode, 0)).not.to.be
      .reverted;
  } else {
    await utils.web3.approve(user, lendingPoolAddress, assetAmount);
    const lendingPool = protocols.aavev2.contracts.LendingPool__factory.connect(lendingPoolAddress, user);
    await expect(
      lendingPool.borrow(assetAmount.token.address, assetAmount.amountWei, interestRateMode, 0, user.address)
    ).not.to.be.reverted;
  }
}

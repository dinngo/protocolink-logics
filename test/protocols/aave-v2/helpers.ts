import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as core from 'src/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as protocols from 'src/protocols';
import * as utils from 'test/utils';

export async function deposit(chainId: number, user: SignerWithAddress, input: core.tokens.TokenAmount) {
  const aaveV2Service = new protocols.aavev2.AaveV2Service({ chainId, provider: hre.ethers.provider });
  const lendingPoolAddress = await aaveV2Service.getLendingPoolAddress();
  if (input.token.isNative()) {
    const wethGatewayAddress = await aaveV2Service.getWETHGatewayAddress();
    const wethGateway = protocols.aavev2.contracts.WETHGateway__factory.connect(wethGatewayAddress, user);
    await expect(wethGateway.depositETH(lendingPoolAddress, user.address, 0, { value: input.amountWei })).not.to.be
      .reverted;
  } else {
    await utils.web3.approve(user, lendingPoolAddress, input);
    const lendingPool = protocols.aavev2.contracts.LendingPool__factory.connect(lendingPoolAddress, user);
    await expect(lendingPool.deposit(input.token.address, input.amountWei, user.address, 0)).not.to.be.reverted;
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

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { approve } from '@composable-router/test-helpers';
import * as common from '@composable-router/common';
import * as compoundv2 from 'src/compound-v2';
import { expect } from 'chai';

export async function supply(user: SignerWithAddress, supplyAmount: common.TokenAmount) {
  const cToken = compoundv2.toCToken(supplyAmount.token);
  if (supplyAmount.token.isNative) {
    await expect(compoundv2.CEther__factory.connect(cToken.address, user).mint({ value: supplyAmount.amountWei })).to
      .not.be.reverted;
  } else {
    await approve(user, cToken.address, supplyAmount);
    await expect(compoundv2.CErc20__factory.connect(cToken.address, user).mint(supplyAmount.amountWei)).to.not.be
      .reverted;
  }
}

export async function enterMarkets(user: SignerWithAddress, collaterals: common.Token[]) {
  const cTokenAddresses = collaterals.map((collateral) => compoundv2.toCToken(collateral).address);
  await expect(
    compoundv2.Comptroller__factory.connect(compoundv2.getContractAddress('Comptroller'), user).enterMarkets(
      cTokenAddresses
    )
  ).to.not.be.reverted;
}

export async function borrow(user: SignerWithAddress, borrowAmount: common.TokenAmount) {
  const cToken = compoundv2.toCToken(borrowAmount.token);
  await expect(compoundv2.CErc20__factory.connect(cToken.address, user).borrow(borrowAmount.amountWei)).to.not.be
    .reverted;
}

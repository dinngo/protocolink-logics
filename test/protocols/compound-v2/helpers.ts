import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { approve } from '@composable-router/test-helpers';
import * as common from '@composable-router/common';
import { expect } from 'chai';
import * as protocols from 'src/protocols';

export async function supply(user: SignerWithAddress, supplyAmount: common.TokenAmount) {
  const cToken = protocols.compoundv2.toCToken(supplyAmount.token);
  if (supplyAmount.token.isNative) {
    const cEther = protocols.compoundv2.CEther__factory.connect(cToken.address, user);
    await expect(cEther.mint({ value: supplyAmount.amountWei })).to.not.be.reverted;
  } else {
    await approve(user, cToken.address, supplyAmount);
    const cErc20 = protocols.compoundv2.CErc20__factory.connect(cToken.address, user);
    await expect(cErc20.mint(supplyAmount.amountWei)).to.not.be.reverted;
  }
}

export async function enterMarkets(user: SignerWithAddress, collaterals: common.Token[]) {
  const comptrollerAddress = protocols.compoundv2.getContractAddress('Comptroller');
  const comptroller = protocols.compoundv2.Comptroller__factory.connect(comptrollerAddress, user);
  const cTokenAddresses = collaterals.map((collateral) => protocols.compoundv2.toCToken(collateral).address);
  await expect(comptroller.enterMarkets(cTokenAddresses)).to.not.be.reverted;
}

export async function borrow(user: SignerWithAddress, borrowAmount: common.TokenAmount) {
  const cToken = protocols.compoundv2.toCToken(borrowAmount.token);
  const cErc20 = protocols.compoundv2.CErc20__factory.connect(cToken.address, user);
  await expect(cErc20.borrow(borrowAmount.amountWei)).to.not.be.reverted;
}

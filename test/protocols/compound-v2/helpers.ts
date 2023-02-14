import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as core from 'src/core';
import { expect } from 'chai';
import * as protocols from 'src/protocols';
import * as utils from 'test/utils';

export async function supply(user: SignerWithAddress, supplyAmount: core.tokens.TokenAmount) {
  const cToken = protocols.compoundv2.tokens.toCToken(supplyAmount.token);
  if (supplyAmount.token.isNative()) {
    const cEther = protocols.compoundv2.contracts.CEther__factory.connect(cToken.address, user);
    await expect(cEther.mint({ value: supplyAmount.amountWei })).not.to.be.reverted;
  } else {
    await utils.web3.approve(user, cToken.address, supplyAmount);
    const cErc20 = protocols.compoundv2.contracts.CErc20__factory.connect(cToken.address, user);
    await expect(cErc20.mint(supplyAmount.amountWei)).not.to.be.reverted;
  }
}

export async function enterMarkets(user: SignerWithAddress, collaterals: core.tokens.Token[]) {
  const comptrollerAddress = protocols.compoundv2.config.getContractAddress('Comptroller');
  const comptroller = protocols.compoundv2.contracts.Comptroller__factory.connect(comptrollerAddress, user);
  const cTokenAddresses = collaterals.map((collateral) => protocols.compoundv2.tokens.toCToken(collateral).address);
  await expect(comptroller.enterMarkets(cTokenAddresses)).not.to.be.reverted;
}

export async function borrow(user: SignerWithAddress, borrowAmount: core.tokens.TokenAmount) {
  const cToken = protocols.compoundv2.tokens.toCToken(borrowAmount.token);
  const cErc20 = protocols.compoundv2.contracts.CErc20__factory.connect(cToken.address, user);
  await expect(cErc20.borrow(borrowAmount.amountWei)).not.to.be.reverted;
}

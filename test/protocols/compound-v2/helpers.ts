import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as core from 'src/core';
import { expect } from 'chai';
import * as protocols from 'src/protocols';
import * as utils from 'test/utils';

export async function supply(
  user: SignerWithAddress,
  supplyAmount: core.tokens.TokenAmount,
  tokenOut: core.tokens.Token
) {
  if (supplyAmount.token.isNative()) {
    const cEther = protocols.compoundv2.contracts.CEther__factory.connect(tokenOut.address, user);
    await expect(cEther.mint({ value: supplyAmount.amountWei })).not.to.be.reverted;
  } else {
    await utils.web3.approve(user, tokenOut.address, supplyAmount);
    const cErc20 = protocols.compoundv2.contracts.CErc20__factory.connect(tokenOut.address, user);
    await expect(cErc20.mint(supplyAmount.amountWei)).not.to.be.reverted;
  }
}

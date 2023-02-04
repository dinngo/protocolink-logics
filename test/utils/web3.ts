import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { constants } from 'ethers';
import * as core from 'src/core';
import { expect } from 'chai';
import hre from 'hardhat';

export async function getBalance(account: string, token: core.tokens.Token) {
  const tokenAmount = new core.tokens.TokenAmount(token);
  const balance = token.isNative()
    ? await hre.ethers.provider.getBalance(account)
    : await core.contracts.ERC20__factory.connect(token.address, hre.ethers.provider).balanceOf(account);
  tokenAmount.setWei(balance);
  return tokenAmount;
}

export async function approve(user: SignerWithAddress, spender: string, tokenAmount: core.tokens.TokenAmount) {
  if (tokenAmount.token.isNative()) return;

  const erc20 = core.contracts.ERC20__factory.connect(tokenAmount.token.address, user);
  const allowance = await erc20.allowance(user.address, spender);
  if (allowance.gte(tokenAmount.amountWei)) return;
  await expect(erc20.approve(spender, constants.MaxUint256)).not.to.be.reverted;
}

export async function approves(user: SignerWithAddress, spender: string, tokenAmounts: core.tokens.TokenAmounts) {
  return Promise.all(tokenAmounts.toArray().map((tokenAmount) => approve(user, spender, tokenAmount)));
}

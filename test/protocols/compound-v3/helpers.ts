import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { approve } from '@composable-router/test-helpers';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as protocols from 'src/protocols';

export async function allow(chainId: number, user: SignerWithAddress, marketId: string) {
  const userAgent = core.calcAccountAgent(chainId, user.address);

  const compoundV3Service = new protocols.compoundv3.Service(chainId, hre.ethers.provider);
  const isAllowed = await compoundV3Service.isAllowed(marketId, user.address, userAgent);
  if (!isAllowed) {
    const tx = await compoundV3Service.buildAllowTransactionRequest(marketId, userAgent, true);
    await expect(user.sendTransaction(tx)).to.not.be.reverted;
  }
}

export async function supply(chainId: number, user: SignerWithAddress, marketId: string, supply: common.TokenAmount) {
  const market = protocols.compoundv3.getMarket(chainId, marketId);
  await approve(user, market.cometAddress, supply);
  const contractComet = protocols.compoundv3.Comet__factory.connect(market.cometAddress, user);
  await expect(contractComet.supply(supply.token.address, supply.amountWei)).to.not.be.reverted;
}

export async function borrow(chainId: number, user: SignerWithAddress, marketId: string, borrow: common.TokenAmount) {
  const market = protocols.compoundv3.getMarket(chainId, marketId);
  const contractComet = protocols.compoundv3.Comet__factory.connect(market.cometAddress, user);
  await expect(contractComet.withdraw(borrow.token.address, borrow.amountWei)).to.not.be.reverted;
}

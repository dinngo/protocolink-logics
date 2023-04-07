import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { approve } from '@furucombo/composable-router-test-helpers';
import * as common from '@furucombo/composable-router-common';
import * as compoundv3 from 'src/compound-v3';
import * as core from '@furucombo/composable-router-core';
import { expect } from 'chai';
import hre from 'hardhat';

export async function allow(chainId: number, user: SignerWithAddress, marketId: string) {
  const userAgent = core.calcAccountAgent(chainId, user.address);

  const service = new compoundv3.Service(chainId, hre.ethers.provider);
  const isAllowed = await service.isAllowed(marketId, user.address, userAgent);
  if (!isAllowed) {
    const tx = await service.buildAllowTransactionRequest(marketId, userAgent, true);
    await expect(user.sendTransaction(tx)).to.not.be.reverted;
  }
}

export async function supply(chainId: number, user: SignerWithAddress, marketId: string, supply: common.TokenAmount) {
  const market = compoundv3.getMarket(chainId, marketId);
  await approve(user, market.cometAddress, supply);
  await expect(
    compoundv3.Comet__factory.connect(market.cometAddress, user).supply(supply.token.address, supply.amountWei)
  ).to.not.be.reverted;
}

export async function borrow(chainId: number, user: SignerWithAddress, marketId: string, borrow: common.TokenAmount) {
  const market = compoundv3.getMarket(chainId, marketId);
  await expect(
    compoundv3.Comet__factory.connect(market.cometAddress, user).withdraw(borrow.token.address, borrow.amountWei)
  ).to.not.be.reverted;
}

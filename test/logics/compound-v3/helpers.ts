import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { approve } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as compoundv3 from 'src/logics/compound-v3';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import hre from 'hardhat';

export async function allow(chainId: number, user: SignerWithAddress, marketId: string) {
  const routerKit = new core.RouterKit(chainId);
  const agent = await routerKit.calcAgent(user.address);

  const service = new compoundv3.Service(chainId, hre.ethers.provider);
  const isAllowed = await service.isAllowed(marketId, user.address, agent);
  if (!isAllowed) {
    const tx = await service.buildAllowTransactionRequest(marketId, agent, true);
    await expect(user.sendTransaction(tx)).to.not.be.reverted;
  }
}

export async function supply(chainId: number, user: SignerWithAddress, marketId: string, supply: common.TokenAmount) {
  const market = compoundv3.getMarket(chainId, marketId);
  await approve(user, market.comet.address, supply);
  await expect(
    compoundv3.Comet__factory.connect(market.comet.address, user).supply(supply.token.address, supply.amountWei)
  ).to.not.be.reverted;
}

export async function borrow(chainId: number, user: SignerWithAddress, marketId: string, borrow: common.TokenAmount) {
  const market = compoundv3.getMarket(chainId, marketId);
  await expect(
    compoundv3.Comet__factory.connect(market.comet.address, user).withdraw(borrow.token.address, borrow.amountWei)
  ).to.not.be.reverted;
}

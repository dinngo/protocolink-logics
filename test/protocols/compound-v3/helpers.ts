import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { approve } from '@composable-router/test-helpers';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as protocols from 'src/protocols';
import { utils } from 'ethers';

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
  if (supply.token.isNative) {
    const ifaceBulker = new utils.Interface(market.bulker.abi);
    const data = ifaceBulker.encodeFunctionData('invoke', [
      [market.bulker.actions.supplyNativeToken],
      [protocols.compoundv3.encodeSupplyNativeTokenAction(market.cometAddress, user.address, supply.amountWei)],
    ]);
    await expect(user.sendTransaction({ to: market.bulker.address, data, value: supply.amountWei })).to.not.be.reverted;
  } else {
    await approve(user, market.cometAddress, supply);
    const contractComet = protocols.compoundv3.Comet__factory.connect(market.cometAddress, user);
    await expect(contractComet.supply(supply.token.address, supply.amountWei)).to.not.be.reverted;
  }
}

export async function getCollateralBalance(chainId: number, account: string, marketId: string, asset: common.Token) {
  const market = protocols.compoundv3.getMarket(chainId, marketId);
  const contractComet = protocols.compoundv3.Comet__factory.connect(market.cometAddress, hre.ethers.provider);
  const collateralBalance = await contractComet.collateralBalanceOf(account, asset.wrapped.address);

  return new common.TokenAmount(asset).setWei(collateralBalance);
}

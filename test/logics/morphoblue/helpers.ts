import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { approve } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as morphoblue from 'src/logics/morphoblue';

export async function authorize(chainId: number, user: SignerWithAddress) {
  const routerKit = new core.RouterKit(chainId);
  const agent = await routerKit.calcAgent(user.address);

  const service = new morphoblue.Service(chainId, hre.ethers.provider);
  const isAuthorized = await service.isAuthorized(user.address, agent);
  if (!isAuthorized) {
    const tx = service.buildAuthorizeTransactionRequest(agent, true);
    await expect(user.sendTransaction(tx)).to.not.be.reverted;
  }
}

export async function supply(chainId: number, user: SignerWithAddress, marketId: string, supply: common.TokenAmount) {
  const market = morphoblue.getMarket(chainId, marketId);
  const morphoAddress = morphoblue.getContractAddress(chainId, 'Morpho');
  await approve(user, morphoAddress, supply);
  await expect(
    morphoblue.Morpho__factory.connect(morphoAddress, user).supply(
      {
        loanToken: market.loanToken.address,
        collateralToken: market.collateralToken.address,
        oracle: market.oracle,
        irm: market.irm,
        lltv: market.lltv,
      },
      supply.amountWei,
      0,
      user.address,
      '0x'
    )
  ).to.not.be.reverted;
  await expect(user.address).to.changeBalance(supply.token, -supply.amount);
}

export async function supplyCollateral(
  chainId: number,
  user: SignerWithAddress,
  marketId: string,
  supply: common.TokenAmount
) {
  const market = morphoblue.getMarket(chainId, marketId);
  const morphoAddress = morphoblue.getContractAddress(chainId, 'Morpho');
  await approve(user, morphoAddress, supply);
  await expect(
    morphoblue.Morpho__factory.connect(morphoAddress, user).supplyCollateral(
      {
        loanToken: market.loanToken.address,
        collateralToken: market.collateralToken.address,
        oracle: market.oracle,
        irm: market.irm,
        lltv: market.lltv,
      },
      supply.amountWei,
      user.address,
      '0x'
    )
  ).to.not.be.reverted;
  await expect(user.address).to.changeBalance(supply.token, -supply.amount);
}

export async function borrow(chainId: number, user: SignerWithAddress, marketId: string, borrow: common.TokenAmount) {
  const market = morphoblue.getMarket(chainId, marketId);
  const morphoAddress = morphoblue.getContractAddress(chainId, 'Morpho');
  await approve(user, morphoAddress, borrow);

  await expect(
    morphoblue.Morpho__factory.connect(morphoAddress, user).borrow(
      {
        loanToken: market.loanToken.address,
        collateralToken: market.collateralToken.address,
        oracle: market.oracle,
        irm: market.irm,
        lltv: market.lltv,
      },
      borrow.amountWei,
      0,
      user.address,
      user.address
    )
  ).to.not.be.reverted;
  await expect(user.address).to.changeBalance(borrow.token, borrow.amount);
}

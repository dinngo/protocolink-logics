import { JsonRpcSigner } from '@ethersproject/providers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as common from '@protocolink/common';
import { constants } from 'ethers';
import { expect } from 'chai';
import * as sonne from 'src/logics/sonne';

export async function supply(
  chainId: number,
  user: SignerWithAddress | JsonRpcSigner,
  supplyAmount: common.TokenAmount
) {
  const cToken = sonne.toCToken(chainId, supplyAmount.token);
  await approve(user, cToken.address, supplyAmount);
  await expect(sonne.CErc20Immutable__factory.connect(cToken.address, user).mint(supplyAmount.amountWei)).to.not.be
    .reverted;
}

export async function approve(
  user: SignerWithAddress | JsonRpcSigner,
  spender: string,
  tokenAmount: common.TokenAmount
) {
  if (tokenAmount.token.isNative) return;

  const erc20 = common.ERC20__factory.connect(tokenAmount.token.address, user);
  const userAddress = user instanceof SignerWithAddress ? user.address : user._address;
  const allowance = await erc20.allowance(userAddress, spender);
  if (allowance.gte(tokenAmount.amountWei)) return;
  await expect(erc20.approve(spender, constants.MaxUint256)).not.to.be.reverted;
}

export async function enterMarkets(
  chainId: number,
  user: SignerWithAddress | JsonRpcSigner,
  collaterals: common.Token[]
) {
  const cTokenAddresses = collaterals.map((collateral) => sonne.toCToken(chainId, collateral).address);
  await expect(
    sonne.Comptroller__factory.connect(sonne.getContractAddress(chainId, 'Comptroller'), user).enterMarkets(
      cTokenAddresses
    )
  ).to.not.be.reverted;
}

export async function borrow(
  chainId: number,
  user: SignerWithAddress | JsonRpcSigner,
  borrowAmount: common.TokenAmount
) {
  const cToken = sonne.toCToken(chainId, borrowAmount.token);
  await expect(sonne.CErc20Immutable__factory.connect(cToken.address, user).borrow(borrowAmount.amountWei)).to.not.be
    .reverted;
}

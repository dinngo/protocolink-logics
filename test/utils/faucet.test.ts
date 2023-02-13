import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as core from 'src/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as utils from 'test/utils';

describe('Test faucet claim', function () {
  let user: SignerWithAddress;

  before(async function () {
    [, user] = await hre.ethers.getSigners();
  });

  const cases = [
    { tokenAmount: new core.tokens.TokenAmount(core.tokens.mainnet.ETH, '1') },
    { tokenAmount: new core.tokens.TokenAmount(core.tokens.mainnet.WETH, '1') },
    { tokenAmount: new core.tokens.TokenAmount(core.tokens.mainnet.USDC, '1') },
  ];

  cases.forEach(({ tokenAmount }) => {
    it(`claim ${tokenAmount.token.symbol}`, async function () {
      const balanceBefore = await utils.web3.getBalance(user.address, tokenAmount.token);
      await utils.faucet.claim(tokenAmount, user.address);
      const balanceAfter = await utils.web3.getBalance(user.address, tokenAmount.token);

      expect(balanceAfter.sub(balanceBefore).amountWei).to.eq(tokenAmount.amountWei);
    });
  });
});

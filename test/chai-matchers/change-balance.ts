import { BigNumber } from 'ethers';
import BigNumberJS from 'bignumber.js';
import * as core from 'src/core';

export function supportChangeBalance(Assertion: Chai.AssertionStatic, utils: Chai.ChaiUtils) {
  Assertion.addMethod(
    'changeBalance',
    function (this: any, token: core.tokens.Token, balanceChange: string, decimalPlaces?: number) {
      const promise = getBalances(utils.flag(this, 'object'), token).then(([before, after]) => {
        let beforeAmount = BigNumberJS(before.amount);
        let afterAmount = BigNumberJS(after.amount);
        if (decimalPlaces !== undefined) {
          beforeAmount = beforeAmount.decimalPlaces(decimalPlaces);
          afterAmount = afterAmount.decimalPlaces(decimalPlaces);
        }
        new Assertion(afterAmount.minus(beforeAmount).toString()).to.eq(BigNumberJS(balanceChange).toString());
      });
      this.then = promise.then.bind(promise);
      this.catch = promise.then.bind(promise);

      return this;
    }
  );
}

async function getBalances(account: string, token: core.tokens.Token) {
  const hre = await import('hardhat');
  const blockNumber = await hre.ethers.provider.getBlockNumber();

  let balanceBefore: BigNumber;
  let balanceAfter: BigNumber;
  if (token.isNative()) {
    balanceBefore = await hre.ethers.provider.getBalance(account, blockNumber - 1);
    balanceAfter = await hre.ethers.provider.getBalance(account, blockNumber);
  } else {
    const erc20 = core.contracts.ERC20__factory.connect(token.address, hre.ethers.provider);
    balanceBefore = await erc20.balanceOf(account, { blockTag: blockNumber - 1 });
    balanceAfter = await erc20.balanceOf(account, { blockTag: blockNumber });
  }
  const before = new core.tokens.TokenAmount(token).setWei(balanceBefore);
  const after = new core.tokens.TokenAmount(token).setWei(balanceAfter);

  return [before, after];
}

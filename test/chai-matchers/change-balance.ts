import { BigNumber } from 'ethers';
import * as core from 'src/core';

export function supportChangeBalance(Assertion: Chai.AssertionStatic, utils: Chai.ChaiUtils) {
  Assertion.addMethod(
    'changeBalance',
    function (this: any, token: core.tokens.Token, expectedBalanceChange: string, slippage?: number) {
      const promise = getBalances(utils.flag(this, 'object'), token).then(([before, after]) => {
        const balanceChange = after.amountWei.sub(before.amountWei);
        let expectedBalanceChangeWei = core.utils.toSmallUnit(expectedBalanceChange, token.decimals);
        if (slippage !== undefined) {
          expectedBalanceChangeWei = core.utils.calcSlippage(expectedBalanceChangeWei, slippage);
          if (balanceChange.isNegative()) {
            new Assertion(balanceChange).to.lte(expectedBalanceChangeWei);
          } else {
            new Assertion(balanceChange).to.gte(expectedBalanceChangeWei);
          }
        } else {
          new Assertion(balanceChange).to.eq(expectedBalanceChangeWei);
        }
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

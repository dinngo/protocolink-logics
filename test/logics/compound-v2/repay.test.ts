import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, mainnetTokens, snapshotAndRevertEach } from '@composable-router/test-helpers';
import * as common from '@composable-router/common';
import * as compoundv2 from 'src/compound-v2';
import * as core from '@composable-router/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';
import * as hrehelpers from '@nomicfoundation/hardhat-network-helpers';
import * as utils from 'test/utils';

describe('Test CompoundV2 Repay Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    await claimToken(chainId, user.address, mainnetTokens.WBTC, '10');
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      supply: new common.TokenAmount(compoundv2.underlyingTokens.ETH, '100'),
      borrow: new common.TokenAmount(compoundv2.underlyingTokens.WBTC, '1'),
    },
    {
      supply: new common.TokenAmount(compoundv2.underlyingTokens.WBTC, '1'),
      borrow: new common.TokenAmount(compoundv2.underlyingTokens.ETH, '1'),
    },
    {
      supply: new common.TokenAmount(compoundv2.underlyingTokens.ETH, '100'),
      borrow: new common.TokenAmount(compoundv2.underlyingTokens.WBTC, '1'),
      amountBps: 5000,
    },
    {
      supply: new common.TokenAmount(compoundv2.underlyingTokens.WBTC, '1'),
      borrow: new common.TokenAmount(compoundv2.underlyingTokens.ETH, '1'),
      amountBps: 5000,
    },
  ];

  testCases.forEach(({ supply, borrow, amountBps }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. supply, enterMarkets and borrow first
      await helpers.supply(user, supply);
      await helpers.enterMarkets(user, [supply.token]);
      await helpers.borrow(user, borrow);

      // 2. get borrow balance after 1000 blocks
      await hrehelpers.mine(1000);
      const logicCompoundV2Repay = new compoundv2.RepayLogic(chainId, hre.ethers.provider);
      const { input } = await logicCompoundV2Repay.quote({ borrower: user.address, tokenIn: borrow.token });
      expect(input.amountWei).to.be.gt(borrow.amountWei);

      // 3. build input, funds, tokensReturn
      const funds = new common.TokenAmounts();
      if (amountBps) {
        funds.add(utils.calcRequiredAmountByAmountBps(input, amountBps));
      } else {
        funds.add(input);
      }
      const tokensReturn = [input.token.elasticAddress];

      // 4. build router logics
      const erc20Funds = funds.erc20;
      const routerLogics = await utils.getPermitAndPullTokenRouterLogics(chainId, user, erc20Funds);
      routerLogics.push(await logicCompoundV2Repay.build({ input, amountBps, borrower: user.address }));

      // 5. send router tx
      const transactionRequest = core.newRouterExecuteTransactionRequest({
        chainId,
        routerLogics,
        tokensReturn,
        value: funds.native?.amountWei ?? 0,
      });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
      await expect(user.address).to.changeBalance(input.token, -input.amount, 1);
    });
  });
});

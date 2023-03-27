import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, snapshotAndRevertEach } from '@composable-router/test-helpers';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';
import * as protocols from 'src/protocols';
import * as utils from 'test/utils';

describe('Test CompoundV3 Repay Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;
  let compoundV3Service: protocols.compoundv3.Service;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    compoundV3Service = new protocols.compoundv3.Service(chainId, hre.ethers.provider);
    await claimToken(chainId, user.address, protocols.compoundv3.mainnetTokens.USDC, '10');
    await claimToken(chainId, user.address, protocols.compoundv3.mainnetTokens.ETH.wrapped, '10');
    await claimToken(chainId, user.address, protocols.compoundv3.mainnetTokens.cbETH, '10');
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      marketId: protocols.compoundv3.MarketId.USDC,
      supply: new common.TokenAmount(protocols.compoundv3.mainnetTokens.ETH, '1'),
      borrow: new common.TokenAmount(protocols.compoundv3.mainnetTokens.USDC, '100'),
      repay: { tokenIn: protocols.compoundv3.mainnetTokens.USDC, repayAll: false },
    },
    {
      marketId: protocols.compoundv3.MarketId.USDC,
      supply: new common.TokenAmount(protocols.compoundv3.mainnetTokens.ETH, '1'),
      borrow: new common.TokenAmount(protocols.compoundv3.mainnetTokens.USDC, '100'),
      repay: { tokenIn: protocols.compoundv3.mainnetTokens.USDC, repayAll: true },
    },
    {
      marketId: protocols.compoundv3.MarketId.ETH,
      supply: new common.TokenAmount(protocols.compoundv3.mainnetTokens.cbETH, '3'),
      borrow: new common.TokenAmount(protocols.compoundv3.mainnetTokens.ETH.wrapped, '1'),
      repay: { tokenIn: protocols.compoundv3.mainnetTokens.ETH.wrapped, repayAll: false },
    },
    {
      marketId: protocols.compoundv3.MarketId.ETH,
      supply: new common.TokenAmount(protocols.compoundv3.mainnetTokens.cbETH, '3'),
      borrow: new common.TokenAmount(protocols.compoundv3.mainnetTokens.ETH.wrapped, '1'),
      repay: { tokenIn: protocols.compoundv3.mainnetTokens.ETH.wrapped, repayAll: true },
    },
  ];

  testCases.forEach(({ marketId, supply, borrow, repay }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. supply and borrow first
      await helpers.supply(chainId, user, marketId, supply);
      await helpers.borrow(chainId, user, marketId, borrow);

      // 2. build funds, tokensReturn
      const repayAmount = repay.repayAll ? common.calcSlippage(borrow.amountWei, -100) : borrow.amountWei.div(2);
      const input = new common.TokenAmount(repay.tokenIn).setWei(repayAmount);
      const tokensReturn = [input.token.elasticAddress];
      const funds = new common.TokenAmounts(input);

      // 3. build router logics
      const erc20Funds = funds.erc20;
      const routerLogics = await utils.getPermitAndPullTokenRouterLogics(chainId, user, erc20Funds);

      const compoundV3RepayLogic = new protocols.compoundv3.RepayLogic(chainId, hre.ethers.provider);
      routerLogics.push(
        await compoundV3RepayLogic.getLogic({ marketId, input, repayAll: repay.repayAll }, { account: user.address })
      );

      // 4. send router tx
      const transactionRequest = core.newRouterExecuteTransactionRequest({
        chainId,
        routerLogics,
        tokensReturn,
        value: funds.native?.amountWei ?? 0,
      });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
      const borrowBalance = await compoundV3Service.getBorrowBalance(user.address, marketId);
      if (repay.repayAll) {
        expect(borrowBalance.amountWei).to.eq(0);
        await expect(user.address).to.changeBalance(input.token, -borrow.amount, 1);
      } else {
        await expect(user.address).to.changeBalance(input.token, -input.amount);
      }
    });
  });
});

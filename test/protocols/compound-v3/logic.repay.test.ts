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
  let users: SignerWithAddress[];
  let compoundV3Service: protocols.compoundv3.Service;

  before(async function () {
    chainId = await getChainId();
    const [, user1, user2] = await hre.ethers.getSigners();
    users = [user1, user2];
    compoundV3Service = new protocols.compoundv3.Service(chainId, hre.ethers.provider);
    await claimToken(chainId, user1.address, protocols.compoundv3.mainnetTokens.USDC, '5');
    await claimToken(chainId, user1.address, protocols.compoundv3.mainnetTokens.WETH, '5');
    await claimToken(chainId, user1.address, protocols.compoundv3.mainnetTokens.wstETH, '5');
    await claimToken(chainId, user2.address, protocols.compoundv3.mainnetTokens.USDC, '150');
    await claimToken(chainId, user2.address, protocols.compoundv3.mainnetTokens.WETH, '5');
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      title: 'USDC market: repay fixed amount',
      borrowerIndex: 0,
      repayerIndex: 0,
      marketId: protocols.compoundv3.MarketId.USDC,
      supply: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WETH, '1'),
      borrow: new common.TokenAmount(protocols.compoundv3.mainnetTokens.USDC, '100'),
      repay: new common.TokenAmount(protocols.compoundv3.mainnetTokens.USDC, '50'),
    },
    {
      title: 'USDC market: repay 50% amount',
      borrowerIndex: 0,
      repayerIndex: 0,
      marketId: protocols.compoundv3.MarketId.USDC,
      supply: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WETH, '1'),
      borrow: new common.TokenAmount(protocols.compoundv3.mainnetTokens.USDC, '100'),
      repay: new common.TokenAmount(protocols.compoundv3.mainnetTokens.USDC, '50'),
      amountBps: 5000,
    },
    {
      title: 'USDC market: repay 100% amount',
      borrowerIndex: 0,
      repayerIndex: 0,
      marketId: protocols.compoundv3.MarketId.USDC,
      supply: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WETH, '1'),
      borrow: new common.TokenAmount(protocols.compoundv3.mainnetTokens.USDC, '100'),
      repay: new common.TokenAmount(protocols.compoundv3.mainnetTokens.USDC, '101'),
      amountBps: 10000,
    },
    {
      title: 'USDC market: repay more amount',
      borrowerIndex: 0,
      repayerIndex: 0,
      marketId: protocols.compoundv3.MarketId.USDC,
      supply: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WETH, '1'),
      borrow: new common.TokenAmount(protocols.compoundv3.mainnetTokens.USDC, '100'),
      repay: new common.TokenAmount(protocols.compoundv3.mainnetTokens.USDC, '101'),
    },
    {
      title: 'ETH market: repay fixed amount',
      borrowerIndex: 0,
      repayerIndex: 0,
      marketId: protocols.compoundv3.MarketId.ETH,
      supply: new common.TokenAmount(protocols.compoundv3.mainnetTokens.wstETH, '5'),
      borrow: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WETH, '2'),
      repay: new common.TokenAmount(protocols.compoundv3.mainnetTokens.ETH, '1'),
    },
    {
      title: 'ETH market: repay 50% amount',
      borrowerIndex: 0,
      repayerIndex: 0,
      marketId: protocols.compoundv3.MarketId.ETH,
      supply: new common.TokenAmount(protocols.compoundv3.mainnetTokens.wstETH, '5'),
      borrow: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WETH, '2'),
      repay: new common.TokenAmount(protocols.compoundv3.mainnetTokens.ETH, '1'),
      amountBps: 5000,
    },
    {
      title: 'ETH market: repay 100% amount',
      borrowerIndex: 0,
      repayerIndex: 0,
      marketId: protocols.compoundv3.MarketId.ETH,
      supply: new common.TokenAmount(protocols.compoundv3.mainnetTokens.wstETH, '5'),
      borrow: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WETH, '2'),
      repay: new common.TokenAmount(protocols.compoundv3.mainnetTokens.ETH, '2.01'),
      amountBps: 10000,
    },
    {
      title: 'ETH market: repay more amount',
      borrowerIndex: 0,
      repayerIndex: 0,
      marketId: protocols.compoundv3.MarketId.ETH,
      supply: new common.TokenAmount(protocols.compoundv3.mainnetTokens.wstETH, '5'),
      borrow: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WETH, '2'),
      repay: new common.TokenAmount(protocols.compoundv3.mainnetTokens.ETH, '2.01'),
    },
    {
      title: 'ETH market: repay fixed amount with wrapped token',
      borrowerIndex: 0,
      repayerIndex: 0,
      marketId: protocols.compoundv3.MarketId.ETH,
      supply: new common.TokenAmount(protocols.compoundv3.mainnetTokens.wstETH, '5'),
      borrow: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WETH, '2'),
      repay: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WETH, '1'),
    },
    {
      title: 'ETH market: repay 50% amount with wrapped token',
      borrowerIndex: 0,
      repayerIndex: 0,
      marketId: protocols.compoundv3.MarketId.ETH,
      supply: new common.TokenAmount(protocols.compoundv3.mainnetTokens.wstETH, '5'),
      borrow: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WETH, '2'),
      repay: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WETH, '1'),
      amountBps: 5000,
    },
    {
      title: 'ETH market: repay 100% amount with wrapped token',
      borrowerIndex: 0,
      repayerIndex: 0,
      marketId: protocols.compoundv3.MarketId.ETH,
      supply: new common.TokenAmount(protocols.compoundv3.mainnetTokens.wstETH, '5'),
      borrow: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WETH, '2'),
      repay: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WETH, '2.01'),
      amountBps: 10000,
    },
    {
      title: 'ETH market: repay more amount with wrapped token',
      borrowerIndex: 0,
      repayerIndex: 0,
      marketId: protocols.compoundv3.MarketId.ETH,
      supply: new common.TokenAmount(protocols.compoundv3.mainnetTokens.wstETH, '5'),
      borrow: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WETH, '2'),
      repay: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WETH, '2.01'),
    },
    {
      title: 'USDC market: help to repay fixed amount',
      borrowerIndex: 0,
      repayerIndex: 1,
      marketId: protocols.compoundv3.MarketId.USDC,
      supply: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WETH, '1'),
      borrow: new common.TokenAmount(protocols.compoundv3.mainnetTokens.USDC, '100'),
      repay: new common.TokenAmount(protocols.compoundv3.mainnetTokens.USDC, '50'),
    },
    {
      title: 'USDC market: help to repay 50% amount',
      borrowerIndex: 0,
      repayerIndex: 1,
      marketId: protocols.compoundv3.MarketId.USDC,
      supply: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WETH, '1'),
      borrow: new common.TokenAmount(protocols.compoundv3.mainnetTokens.USDC, '100'),
      repay: new common.TokenAmount(protocols.compoundv3.mainnetTokens.USDC, '50'),
      amountBps: 5000,
    },
    {
      title: 'USDC market: help to repay 100% amount',
      borrowerIndex: 0,
      repayerIndex: 1,
      marketId: protocols.compoundv3.MarketId.USDC,
      supply: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WETH, '1'),
      borrow: new common.TokenAmount(protocols.compoundv3.mainnetTokens.USDC, '100'),
      repay: new common.TokenAmount(protocols.compoundv3.mainnetTokens.USDC, '101'),
      amountBps: 10000,
    },
    {
      title: 'USDC market: help to repay more amount',
      borrowerIndex: 0,
      repayerIndex: 1,
      marketId: protocols.compoundv3.MarketId.USDC,
      supply: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WETH, '1'),
      borrow: new common.TokenAmount(protocols.compoundv3.mainnetTokens.USDC, '100'),
      repay: new common.TokenAmount(protocols.compoundv3.mainnetTokens.USDC, '101'),
    },
    {
      title: 'ETH market: help to repay fixed amount',
      borrowerIndex: 0,
      repayerIndex: 1,
      marketId: protocols.compoundv3.MarketId.ETH,
      supply: new common.TokenAmount(protocols.compoundv3.mainnetTokens.wstETH, '5'),
      borrow: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WETH, '2'),
      repay: new common.TokenAmount(protocols.compoundv3.mainnetTokens.ETH, '1'),
    },
    {
      title: 'ETH market: help to repay 50% amount',
      borrowerIndex: 0,
      repayerIndex: 1,
      marketId: protocols.compoundv3.MarketId.ETH,
      supply: new common.TokenAmount(protocols.compoundv3.mainnetTokens.wstETH, '5'),
      borrow: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WETH, '2'),
      repay: new common.TokenAmount(protocols.compoundv3.mainnetTokens.ETH, '1'),
      amountBps: 5000,
    },
    {
      title: 'ETH market: help to repay 100% amount',
      borrowerIndex: 0,
      repayerIndex: 1,
      marketId: protocols.compoundv3.MarketId.ETH,
      supply: new common.TokenAmount(protocols.compoundv3.mainnetTokens.wstETH, '5'),
      borrow: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WETH, '2'),
      repay: new common.TokenAmount(protocols.compoundv3.mainnetTokens.ETH, '2.01'),
      amountBps: 10000,
    },
    {
      title: 'ETH market: help to repay more amount',
      borrowerIndex: 0,
      repayerIndex: 1,
      marketId: protocols.compoundv3.MarketId.ETH,
      supply: new common.TokenAmount(protocols.compoundv3.mainnetTokens.wstETH, '5'),
      borrow: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WETH, '2'),
      repay: new common.TokenAmount(protocols.compoundv3.mainnetTokens.ETH, '2.01'),
    },
    {
      title: 'ETH market: help to repay fixed amount with wrapped token',
      borrowerIndex: 0,
      repayerIndex: 1,
      marketId: protocols.compoundv3.MarketId.ETH,
      supply: new common.TokenAmount(protocols.compoundv3.mainnetTokens.wstETH, '5'),
      borrow: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WETH, '2'),
      repay: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WETH, '1'),
    },
    {
      title: 'ETH market: help to repay 50% amount with wrapped token',
      borrowerIndex: 0,
      repayerIndex: 1,
      marketId: protocols.compoundv3.MarketId.ETH,
      supply: new common.TokenAmount(protocols.compoundv3.mainnetTokens.wstETH, '5'),
      borrow: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WETH, '2'),
      repay: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WETH, '1'),
      amountBps: 5000,
    },
    {
      title: 'ETH market: help to repay 100% amount with wrapped token',
      borrowerIndex: 0,
      repayerIndex: 1,
      marketId: protocols.compoundv3.MarketId.ETH,
      supply: new common.TokenAmount(protocols.compoundv3.mainnetTokens.wstETH, '5'),
      borrow: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WETH, '2'),
      repay: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WETH, '2.01'),
      amountBps: 10000,
    },
    {
      title: 'ETH market: help to repay more amount with wrapped token',
      borrowerIndex: 0,
      repayerIndex: 1,
      marketId: protocols.compoundv3.MarketId.ETH,
      supply: new common.TokenAmount(protocols.compoundv3.mainnetTokens.wstETH, '5'),
      borrow: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WETH, '2'),
      repay: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WETH, '2.01'),
    },
  ];

  testCases.forEach(({ title, borrowerIndex, repayerIndex, marketId, supply, borrow, repay, amountBps }, i) => {
    it(`case ${i}: ${title}`, async function () {
      const borrower = users[borrowerIndex];
      const repayer = users[repayerIndex];

      // 1. check can supply or not
      const canSupply = await compoundV3Service.canSupply(marketId, supply);
      if (!canSupply) return;

      // 2. supply and borrow first
      await helpers.supply(chainId, borrower, marketId, supply);
      await helpers.borrow(chainId, borrower, marketId, borrow);

      // 3. get quotation
      const compoundV3RepayLogic = new protocols.compoundv3.RepayLogic(chainId, hre.ethers.provider);
      const quotation = await compoundV3RepayLogic.quote({
        marketId,
        borrower: borrower.address,
        tokenIn: repay.token,
      });

      // 3. build funds, tokensReturn
      const tokensReturn = [repay.token.elasticAddress];
      const funds = new common.TokenAmounts();
      if (amountBps) {
        funds.add(utils.calcRequiredAmountByAmountBps(repay, amountBps));
        tokensReturn.push(repay.token.elasticAddress);
      } else {
        funds.add(repay);
      }

      // 4. build router logics
      const erc20Funds = funds.erc20;
      const routerLogics = await utils.getPermitAndPullTokenRouterLogics(chainId, repayer, erc20Funds);
      routerLogics.push(await compoundV3RepayLogic.getLogic({ marketId, borrower: borrower.address, input: repay }));

      // 5. send router tx
      const transactionRequest = core.newRouterExecuteTransactionRequest({
        chainId,
        routerLogics,
        tokensReturn,
        value: funds.native?.amountWei ?? 0,
      });
      await expect(repayer.sendTransaction(transactionRequest)).to.not.be.reverted;
      if (amountBps === common.BPS_BASE || repay.amountWei.gte(quotation.input.amountWei)) {
        const debt = await compoundV3Service.getDebt(marketId, borrower.address);
        expect(debt).to.eq(0);
        await expect(repayer.address).to.changeBalance(repay.token, -borrow.amount, 1);
      } else {
        await expect(repayer.address).to.changeBalance(repay.token, -repay.amount);
      }
    });
  });
});

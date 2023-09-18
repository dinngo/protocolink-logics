import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as compoundv3 from 'src/logics/compound-v3';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';
import * as utils from 'test/utils';

describe('mainnet: Test CompoundV3 Repay Logic', function () {
  let chainId: number;
  let users: SignerWithAddress[];
  let service: compoundv3.Service;

  before(async function () {
    chainId = await getChainId();
    const [, user1, user2] = await hre.ethers.getSigners();
    users = [user1, user2];
    service = new compoundv3.Service(chainId, hre.ethers.provider);
    await claimToken(chainId, user1.address, compoundv3.mainnetTokens.USDC, '5');
    await claimToken(chainId, user1.address, compoundv3.mainnetTokens.WETH, '5');
    await claimToken(chainId, user1.address, compoundv3.mainnetTokens.wstETH, '5');
    await claimToken(chainId, user2.address, compoundv3.mainnetTokens.USDC, '150');
    await claimToken(chainId, user2.address, compoundv3.mainnetTokens.WETH, '5');
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      title: 'USDC market: repay fixed amount',
      borrowerIndex: 0,
      repayerIndex: 0,
      marketId: compoundv3.MarketId.USDC,
      supply: new common.TokenAmount(compoundv3.mainnetTokens.WETH, '1'),
      borrow: new common.TokenAmount(compoundv3.mainnetTokens.USDC, '100'),
      repay: new common.TokenAmount(compoundv3.mainnetTokens.USDC, '50'),
    },
    {
      title: 'USDC market: repay 50% amount',
      borrowerIndex: 0,
      repayerIndex: 0,
      marketId: compoundv3.MarketId.USDC,
      supply: new common.TokenAmount(compoundv3.mainnetTokens.WETH, '1'),
      borrow: new common.TokenAmount(compoundv3.mainnetTokens.USDC, '100'),
      repay: new common.TokenAmount(compoundv3.mainnetTokens.USDC, '50'),
      balanceBps: 5000,
    },
    {
      title: 'USDC market: repay 100% amount',
      borrowerIndex: 0,
      repayerIndex: 0,
      marketId: compoundv3.MarketId.USDC,
      supply: new common.TokenAmount(compoundv3.mainnetTokens.WETH, '1'),
      borrow: new common.TokenAmount(compoundv3.mainnetTokens.USDC, '100'),
      repay: new common.TokenAmount(compoundv3.mainnetTokens.USDC, '101'),
      balanceBps: 10000,
    },
    {
      title: 'USDC market: repay more amount',
      borrowerIndex: 0,
      repayerIndex: 0,
      marketId: compoundv3.MarketId.USDC,
      supply: new common.TokenAmount(compoundv3.mainnetTokens.WETH, '1'),
      borrow: new common.TokenAmount(compoundv3.mainnetTokens.USDC, '100'),
      repay: new common.TokenAmount(compoundv3.mainnetTokens.USDC, '101'),
    },
    {
      title: 'ETH market: repay fixed amount',
      borrowerIndex: 0,
      repayerIndex: 0,
      marketId: compoundv3.MarketId.ETH,
      supply: new common.TokenAmount(compoundv3.mainnetTokens.wstETH, '5'),
      borrow: new common.TokenAmount(compoundv3.mainnetTokens.WETH, '2'),
      repay: new common.TokenAmount(compoundv3.mainnetTokens.ETH, '1'),
    },
    {
      title: 'ETH market: repay 50% amount',
      borrowerIndex: 0,
      repayerIndex: 0,
      marketId: compoundv3.MarketId.ETH,
      supply: new common.TokenAmount(compoundv3.mainnetTokens.wstETH, '5'),
      borrow: new common.TokenAmount(compoundv3.mainnetTokens.WETH, '2'),
      repay: new common.TokenAmount(compoundv3.mainnetTokens.ETH, '1'),
      balanceBps: 5000,
    },
    {
      title: 'ETH market: repay 100% amount',
      borrowerIndex: 0,
      repayerIndex: 0,
      marketId: compoundv3.MarketId.ETH,
      supply: new common.TokenAmount(compoundv3.mainnetTokens.wstETH, '5'),
      borrow: new common.TokenAmount(compoundv3.mainnetTokens.WETH, '2'),
      repay: new common.TokenAmount(compoundv3.mainnetTokens.ETH, '2.01'),
      balanceBps: 10000,
    },
    {
      title: 'ETH market: repay more amount',
      borrowerIndex: 0,
      repayerIndex: 0,
      marketId: compoundv3.MarketId.ETH,
      supply: new common.TokenAmount(compoundv3.mainnetTokens.wstETH, '5'),
      borrow: new common.TokenAmount(compoundv3.mainnetTokens.WETH, '2'),
      repay: new common.TokenAmount(compoundv3.mainnetTokens.ETH, '2.01'),
    },
    {
      title: 'ETH market: repay fixed amount with wrapped token',
      borrowerIndex: 0,
      repayerIndex: 0,
      marketId: compoundv3.MarketId.ETH,
      supply: new common.TokenAmount(compoundv3.mainnetTokens.wstETH, '5'),
      borrow: new common.TokenAmount(compoundv3.mainnetTokens.WETH, '2'),
      repay: new common.TokenAmount(compoundv3.mainnetTokens.WETH, '1'),
    },
    {
      title: 'ETH market: repay 50% amount with wrapped token',
      borrowerIndex: 0,
      repayerIndex: 0,
      marketId: compoundv3.MarketId.ETH,
      supply: new common.TokenAmount(compoundv3.mainnetTokens.wstETH, '5'),
      borrow: new common.TokenAmount(compoundv3.mainnetTokens.WETH, '2'),
      repay: new common.TokenAmount(compoundv3.mainnetTokens.WETH, '1'),
      balanceBps: 5000,
    },
    {
      title: 'ETH market: repay 100% amount with wrapped token',
      borrowerIndex: 0,
      repayerIndex: 0,
      marketId: compoundv3.MarketId.ETH,
      supply: new common.TokenAmount(compoundv3.mainnetTokens.wstETH, '5'),
      borrow: new common.TokenAmount(compoundv3.mainnetTokens.WETH, '2'),
      repay: new common.TokenAmount(compoundv3.mainnetTokens.WETH, '2.01'),
      balanceBps: 10000,
    },
    {
      title: 'ETH market: repay more amount with wrapped token',
      borrowerIndex: 0,
      repayerIndex: 0,
      marketId: compoundv3.MarketId.ETH,
      supply: new common.TokenAmount(compoundv3.mainnetTokens.wstETH, '5'),
      borrow: new common.TokenAmount(compoundv3.mainnetTokens.WETH, '2'),
      repay: new common.TokenAmount(compoundv3.mainnetTokens.WETH, '2.01'),
    },
    {
      title: 'USDC market: help to repay fixed amount',
      borrowerIndex: 0,
      repayerIndex: 1,
      marketId: compoundv3.MarketId.USDC,
      supply: new common.TokenAmount(compoundv3.mainnetTokens.WETH, '1'),
      borrow: new common.TokenAmount(compoundv3.mainnetTokens.USDC, '100'),
      repay: new common.TokenAmount(compoundv3.mainnetTokens.USDC, '50'),
    },
    {
      title: 'USDC market: help to repay 50% amount',
      borrowerIndex: 0,
      repayerIndex: 1,
      marketId: compoundv3.MarketId.USDC,
      supply: new common.TokenAmount(compoundv3.mainnetTokens.WETH, '1'),
      borrow: new common.TokenAmount(compoundv3.mainnetTokens.USDC, '100'),
      repay: new common.TokenAmount(compoundv3.mainnetTokens.USDC, '50'),
      balanceBps: 5000,
    },
    {
      title: 'USDC market: help to repay 100% amount',
      borrowerIndex: 0,
      repayerIndex: 1,
      marketId: compoundv3.MarketId.USDC,
      supply: new common.TokenAmount(compoundv3.mainnetTokens.WETH, '1'),
      borrow: new common.TokenAmount(compoundv3.mainnetTokens.USDC, '100'),
      repay: new common.TokenAmount(compoundv3.mainnetTokens.USDC, '101'),
      balanceBps: 10000,
    },
    {
      title: 'USDC market: help to repay more amount',
      borrowerIndex: 0,
      repayerIndex: 1,
      marketId: compoundv3.MarketId.USDC,
      supply: new common.TokenAmount(compoundv3.mainnetTokens.WETH, '1'),
      borrow: new common.TokenAmount(compoundv3.mainnetTokens.USDC, '100'),
      repay: new common.TokenAmount(compoundv3.mainnetTokens.USDC, '101'),
    },
    {
      title: 'ETH market: help to repay fixed amount',
      borrowerIndex: 0,
      repayerIndex: 1,
      marketId: compoundv3.MarketId.ETH,
      supply: new common.TokenAmount(compoundv3.mainnetTokens.wstETH, '5'),
      borrow: new common.TokenAmount(compoundv3.mainnetTokens.WETH, '2'),
      repay: new common.TokenAmount(compoundv3.mainnetTokens.ETH, '1'),
    },
    {
      title: 'ETH market: help to repay 50% amount',
      borrowerIndex: 0,
      repayerIndex: 1,
      marketId: compoundv3.MarketId.ETH,
      supply: new common.TokenAmount(compoundv3.mainnetTokens.wstETH, '5'),
      borrow: new common.TokenAmount(compoundv3.mainnetTokens.WETH, '2'),
      repay: new common.TokenAmount(compoundv3.mainnetTokens.ETH, '1'),
      balanceBps: 5000,
    },
    {
      title: 'ETH market: help to repay 100% amount',
      borrowerIndex: 0,
      repayerIndex: 1,
      marketId: compoundv3.MarketId.ETH,
      supply: new common.TokenAmount(compoundv3.mainnetTokens.wstETH, '5'),
      borrow: new common.TokenAmount(compoundv3.mainnetTokens.WETH, '2'),
      repay: new common.TokenAmount(compoundv3.mainnetTokens.ETH, '2.01'),
      balanceBps: 10000,
    },
    {
      title: 'ETH market: help to repay more amount',
      borrowerIndex: 0,
      repayerIndex: 1,
      marketId: compoundv3.MarketId.ETH,
      supply: new common.TokenAmount(compoundv3.mainnetTokens.wstETH, '5'),
      borrow: new common.TokenAmount(compoundv3.mainnetTokens.WETH, '2'),
      repay: new common.TokenAmount(compoundv3.mainnetTokens.ETH, '2.01'),
    },
    {
      title: 'ETH market: help to repay fixed amount with wrapped token',
      borrowerIndex: 0,
      repayerIndex: 1,
      marketId: compoundv3.MarketId.ETH,
      supply: new common.TokenAmount(compoundv3.mainnetTokens.wstETH, '5'),
      borrow: new common.TokenAmount(compoundv3.mainnetTokens.WETH, '2'),
      repay: new common.TokenAmount(compoundv3.mainnetTokens.WETH, '1'),
    },
    {
      title: 'ETH market: help to repay 50% amount with wrapped token',
      borrowerIndex: 0,
      repayerIndex: 1,
      marketId: compoundv3.MarketId.ETH,
      supply: new common.TokenAmount(compoundv3.mainnetTokens.wstETH, '5'),
      borrow: new common.TokenAmount(compoundv3.mainnetTokens.WETH, '2'),
      repay: new common.TokenAmount(compoundv3.mainnetTokens.WETH, '1'),
      balanceBps: 5000,
    },
    {
      title: 'ETH market: help to repay 100% amount with wrapped token',
      borrowerIndex: 0,
      repayerIndex: 1,
      marketId: compoundv3.MarketId.ETH,
      supply: new common.TokenAmount(compoundv3.mainnetTokens.wstETH, '5'),
      borrow: new common.TokenAmount(compoundv3.mainnetTokens.WETH, '2'),
      repay: new common.TokenAmount(compoundv3.mainnetTokens.WETH, '2.01'),
      balanceBps: 10000,
    },
    {
      title: 'ETH market: help to repay more amount with wrapped token',
      borrowerIndex: 0,
      repayerIndex: 1,
      marketId: compoundv3.MarketId.ETH,
      supply: new common.TokenAmount(compoundv3.mainnetTokens.wstETH, '5'),
      borrow: new common.TokenAmount(compoundv3.mainnetTokens.WETH, '2'),
      repay: new common.TokenAmount(compoundv3.mainnetTokens.WETH, '2.01'),
    },
  ];

  testCases.forEach(({ title, borrowerIndex, repayerIndex, marketId, supply, borrow, repay, balanceBps }, i) => {
    it(`case ${i}: ${title}`, async function () {
      const borrower = users[borrowerIndex];
      const repayer = users[repayerIndex];

      // 1. check can supply or not
      const canSupply = await service.canSupply(marketId, supply);
      if (!canSupply) return;

      // 2. supply and borrow first
      await helpers.supply(chainId, borrower, marketId, supply);
      await helpers.borrow(chainId, borrower, marketId, borrow);

      // 3. get quotation
      const compoundV3RepayLogic = new compoundv3.RepayLogic(chainId, hre.ethers.provider);
      const quotation = await compoundV3RepayLogic.quote({
        marketId,
        borrower: borrower.address,
        tokenIn: repay.token,
      });

      // 3. build funds, tokensReturn
      const tokensReturn = [repay.token.elasticAddress];
      const funds = new common.TokenAmounts();
      if (balanceBps) {
        funds.add(utils.calcRequiredAmountByBalanceBps(repay, balanceBps));
        tokensReturn.push(repay.token.elasticAddress);
      } else {
        funds.add(repay);
      }

      // 4. build router logics
      const routerLogics: core.DataType.LogicStruct[] = [];
      routerLogics.push(await compoundV3RepayLogic.build({ marketId, borrower: borrower.address, input: repay }));

      // 5. get router permit2 datas
      const permit2Datas = await utils.getRouterPermit2Datas(chainId, repayer, funds.erc20);

      // 6. send router tx
      const routerKit = new core.RouterKit(chainId);
      const transactionRequest = routerKit.buildExecuteTransactionRequest({
        permit2Datas,
        routerLogics,
        tokensReturn,
        value: funds.native?.amountWei ?? 0,
      });
      await expect(repayer.sendTransaction(transactionRequest)).to.not.be.reverted;
      if (balanceBps === common.BPS_BASE || repay.amountWei.gte(quotation.input.amountWei)) {
        const borrowBalance = await service.getBorrowBalance(marketId, borrower.address);
        expect(borrowBalance.amountWei).to.eq(0);
        await expect(repayer.address).to.changeBalance(repay.token, -borrow.amount, 1);
      } else {
        await expect(repayer.address).to.changeBalance(repay.token, -repay.amount);
      }
    });
  });
});

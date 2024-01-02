import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';
import * as morphoblue from 'src/logics/morphoblue';
import * as utils from 'test/utils';

describe('goerli: Test Morphoblue Borrow Logic', function () {
  let chainId: number;
  let users: SignerWithAddress[];
  let service: morphoblue.Service;

  before(async function () {
    chainId = await getChainId();
    const [, user1, user2] = await hre.ethers.getSigners();
    users = [user1, user2];
    service = new morphoblue.Service(chainId, hre.ethers.provider);

    await claimToken(
      chainId,
      user1.address,
      morphoblue.goerliTokens.USDC,
      '5000',
      '0x64c7044050Ba0431252df24fEd4d9635a275CB41'
    );
    await claimToken(
      chainId,
      user1.address,
      morphoblue.goerliTokens.WETH,
      '10',
      '0x88124Ef4A9EC47e691F254F2E8e348fd1e341e9B'
    );
    await claimToken(
      chainId,
      user2.address,
      morphoblue.goerliTokens.USDC,
      '5000',
      '0x64c7044050Ba0431252df24fEd4d9635a275CB41'
    );
    await claimToken(
      chainId,
      user2.address,
      morphoblue.goerliTokens.WETH,
      '10',
      '0x88124Ef4A9EC47e691F254F2E8e348fd1e341e9B'
    );
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      title: 'WETH-USDC market: repay fixed amount',
      borrowerIndex: 0,
      repayerIndex: 0,
      marketId: '0x900d90c624f9bd1e1143059c14610bde45ff7d1746c52bf6c094d3568285b661',
      input: new common.TokenAmount(morphoblue.goerliTokens.WETH, '0.5'),
      collateral: new common.TokenAmount(morphoblue.goerliTokens.USDC, '3000'),
      borrow: new common.TokenAmount(morphoblue.goerliTokens.WETH, '1'),
    },
    {
      title: 'WETH-USDC market: repay 50% amount',
      borrowerIndex: 0,
      repayerIndex: 0,
      marketId: '0x900d90c624f9bd1e1143059c14610bde45ff7d1746c52bf6c094d3568285b661',
      input: new common.TokenAmount(morphoblue.goerliTokens.WETH, '0.5'),
      collateral: new common.TokenAmount(morphoblue.goerliTokens.USDC, '3000'),
      borrow: new common.TokenAmount(morphoblue.goerliTokens.WETH, '1'),
      balanceBps: 5000,
    },
    {
      title: 'WETH-USDC market: repay 100% amount',
      borrowerIndex: 0,
      repayerIndex: 0,
      marketId: '0x900d90c624f9bd1e1143059c14610bde45ff7d1746c52bf6c094d3568285b661',
      input: new common.TokenAmount(morphoblue.goerliTokens.WETH, '0.5'),
      collateral: new common.TokenAmount(morphoblue.goerliTokens.USDC, '3000'),
      borrow: new common.TokenAmount(morphoblue.goerliTokens.WETH, '1'),
      balanceBps: 10000,
    },
    {
      title: 'WETH-USDC market: repay more amount',
      borrowerIndex: 0,
      repayerIndex: 0,
      marketId: '0x900d90c624f9bd1e1143059c14610bde45ff7d1746c52bf6c094d3568285b661',
      input: new common.TokenAmount(morphoblue.goerliTokens.WETH, '2'),
      collateral: new common.TokenAmount(morphoblue.goerliTokens.USDC, '3000'),
      borrow: new common.TokenAmount(morphoblue.goerliTokens.WETH, '1'),
    },
    {
      title: 'WETH-USDC market: repay native fixed amount',
      borrowerIndex: 0,
      repayerIndex: 0,
      marketId: '0x900d90c624f9bd1e1143059c14610bde45ff7d1746c52bf6c094d3568285b661',
      input: new common.TokenAmount(morphoblue.goerliTokens.ETH, '0.5'),
      collateral: new common.TokenAmount(morphoblue.goerliTokens.USDC, '3000'),
      borrow: new common.TokenAmount(morphoblue.goerliTokens.WETH, '1'),
    },
    {
      title: 'WETH-USDC market: repay native 50% amount',
      borrowerIndex: 0,
      repayerIndex: 0,
      marketId: '0x900d90c624f9bd1e1143059c14610bde45ff7d1746c52bf6c094d3568285b661',
      input: new common.TokenAmount(morphoblue.goerliTokens.ETH, '0.5'),
      collateral: new common.TokenAmount(morphoblue.goerliTokens.USDC, '3000'),
      borrow: new common.TokenAmount(morphoblue.goerliTokens.WETH, '1'),
      balanceBps: 5000,
    },
    {
      title: 'WETH-USDC market: repay native 100% amount',
      borrowerIndex: 0,
      repayerIndex: 0,
      marketId: '0x900d90c624f9bd1e1143059c14610bde45ff7d1746c52bf6c094d3568285b661',
      input: new common.TokenAmount(morphoblue.goerliTokens.ETH, '0.5'),
      collateral: new common.TokenAmount(morphoblue.goerliTokens.USDC, '3000'),
      borrow: new common.TokenAmount(morphoblue.goerliTokens.WETH, '1'),
      balanceBps: 10000,
    },
    {
      title: 'WETH-USDC market: repay native more amount',
      borrowerIndex: 0,
      repayerIndex: 0,
      marketId: '0x900d90c624f9bd1e1143059c14610bde45ff7d1746c52bf6c094d3568285b661',
      input: new common.TokenAmount(morphoblue.goerliTokens.ETH, '2'),
      collateral: new common.TokenAmount(morphoblue.goerliTokens.USDC, '3000'),
      borrow: new common.TokenAmount(morphoblue.goerliTokens.WETH, '1'),
    },
    {
      title: 'WETH-USDC market: help repay fixed amount',
      borrowerIndex: 0,
      repayerIndex: 1,
      marketId: '0x900d90c624f9bd1e1143059c14610bde45ff7d1746c52bf6c094d3568285b661',
      input: new common.TokenAmount(morphoblue.goerliTokens.ETH, '0.5'),
      collateral: new common.TokenAmount(morphoblue.goerliTokens.USDC, '3000'),
      borrow: new common.TokenAmount(morphoblue.goerliTokens.WETH, '1'),
    },
    {
      title: 'WETH-USDC market: help repay 50% amount',
      borrowerIndex: 0,
      repayerIndex: 1,
      marketId: '0x900d90c624f9bd1e1143059c14610bde45ff7d1746c52bf6c094d3568285b661',
      input: new common.TokenAmount(morphoblue.goerliTokens.ETH, '0.5'),
      collateral: new common.TokenAmount(morphoblue.goerliTokens.USDC, '3000'),
      borrow: new common.TokenAmount(morphoblue.goerliTokens.WETH, '1'),
      balanceBps: 5000,
    },
    {
      title: 'WETH-USDC market: help repay 100% amount',
      borrowerIndex: 0,
      repayerIndex: 1,
      marketId: '0x900d90c624f9bd1e1143059c14610bde45ff7d1746c52bf6c094d3568285b661',
      input: new common.TokenAmount(morphoblue.goerliTokens.ETH, '0.5'),
      collateral: new common.TokenAmount(morphoblue.goerliTokens.USDC, '3000'),
      borrow: new common.TokenAmount(morphoblue.goerliTokens.WETH, '1'),
      balanceBps: 10000,
    },
    {
      title: 'WETH-USDC market: help repay more amount',
      borrowerIndex: 0,
      repayerIndex: 1,
      marketId: '0x900d90c624f9bd1e1143059c14610bde45ff7d1746c52bf6c094d3568285b661',
      input: new common.TokenAmount(morphoblue.goerliTokens.ETH, '2'),
      collateral: new common.TokenAmount(morphoblue.goerliTokens.USDC, '3000'),
      borrow: new common.TokenAmount(morphoblue.goerliTokens.WETH, '1'),
    },
  ];

  testCases.forEach(({ title, borrowerIndex, repayerIndex, marketId, input, collateral, borrow, balanceBps }, i) => {
    it(`case ${i + 1}: ${title}`, async function () {
      const borrower = users[borrowerIndex];
      const repayer = users[repayerIndex];

      // 1. supply collateral and borrow loan first
      await helpers.supplyCollateral(chainId, borrower, marketId, collateral);
      await helpers.borrow(chainId, borrower, marketId, borrow);

      // 2. authorize userAgent to manage user1 positions
      await helpers.authorize(chainId, borrower);

      // 3. get quotation
      const morphoblueRepayLogic = new morphoblue.RepayLogic(chainId, hre.ethers.provider);
      const quotation = await morphoblueRepayLogic.quote({
        marketId,
        borrower: borrower.address,
        tokenIn: input.token,
      });

      // 4. build funds, tokensReturn
      const tokensReturn = [input.token.elasticAddress];
      const funds = new common.TokenAmounts();
      if (balanceBps) {
        funds.add(utils.calcRequiredAmountByBalanceBps(input, balanceBps));
        tokensReturn.push(input.token.elasticAddress);
      } else {
        funds.add(input);
      }

      // 5. build router logics
      const routerLogics: core.DataType.LogicStruct[] = [];
      routerLogics.push(await morphoblueRepayLogic.build({ marketId, borrower: borrower.address, input, balanceBps }));

      // 6. get router permit2 datas
      const permit2Datas = await utils.getRouterPermit2Datas(chainId, repayer, funds.erc20);

      // 7. send router tx
      const routerKit = new core.RouterKit(chainId);
      const transactionRequest = routerKit.buildExecuteTransactionRequest({
        permit2Datas,
        routerLogics,
        tokensReturn,
        value: funds.native?.amountWei ?? 0,
      });
      await expect(repayer.sendTransaction(transactionRequest)).to.not.be.reverted;

      if (input.amountWei.gt(quotation.input.amountWei)) {
        // repay all
        const borrowBalance = await service.getBorrowBalance(marketId, borrower.address);
        expect(borrowBalance.amountWei).to.eq(0);
        await expect(repayer.address).to.changeBalance(input.token, -borrow.amount, 1);
      } else {
        await expect(repayer.address).to.changeBalance(input.token, -input.amount);
      }
    });
  });
});

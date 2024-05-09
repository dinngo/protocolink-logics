import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';
import * as hrehelpers from '@nomicfoundation/hardhat-network-helpers';
import * as sonne from 'src/logics/sonne';
import * as utils from 'test/utils';

describe('optimism-pb: Test Sonne Repay Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    await claimToken(
      chainId,
      user.address,
      sonne.optimismTokens.WBTC,
      '10',
      '0x078f358208685046a11C85e8ad32895DED33A249'
    );
    await claimToken(
      chainId,
      user.address,
      sonne.optimismTokens.WETH,
      '100',
      '0x86Bb63148d17d445Ed5398ef26Aa05Bf76dD5b59'
    );
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      title: 'ERC20: repay fixed amount',
      supply: new common.TokenAmount(sonne.optimismTokens.WETH, '100'),
      borrow: new common.TokenAmount(sonne.optimismTokens.WBTC, '1'),
      repay: new common.TokenAmount(sonne.optimismTokens.WBTC, '1'),
    },
    {
      title: 'Native: repay fixed amount',
      supply: new common.TokenAmount(sonne.optimismTokens.WBTC, '1'),
      borrow: new common.TokenAmount(sonne.optimismTokens.WETH, '1'),
      repay: new common.TokenAmount(sonne.optimismTokens.ETH, '1'),
    },
    {
      title: 'ERC20: repay 50% amount',
      supply: new common.TokenAmount(sonne.optimismTokens.WETH, '100'),
      borrow: new common.TokenAmount(sonne.optimismTokens.WBTC, '1'),
      repay: new common.TokenAmount(sonne.optimismTokens.WBTC, '1'),
      balanceBps: 5000,
    },
    {
      title: 'Native: repay 50% amount',
      supply: new common.TokenAmount(sonne.optimismTokens.WBTC, '1'),
      borrow: new common.TokenAmount(sonne.optimismTokens.WETH, '1'),
      repay: new common.TokenAmount(sonne.optimismTokens.ETH, '1'),
      balanceBps: 5000,
    },
    {
      title: 'ERC20: repay 100% amount',
      supply: new common.TokenAmount(sonne.optimismTokens.WETH, '100'),
      borrow: new common.TokenAmount(sonne.optimismTokens.WBTC, '1'),
      repay: new common.TokenAmount(sonne.optimismTokens.WBTC, '2'),
      balanceBps: 10000,
    },
    {
      title: 'Native: repay 100% amount',
      supply: new common.TokenAmount(sonne.optimismTokens.WBTC, '1'),
      borrow: new common.TokenAmount(sonne.optimismTokens.WETH, '1'),
      repay: new common.TokenAmount(sonne.optimismTokens.ETH, '2'),
      balanceBps: 10000,
    },
    {
      title: 'ERC20: repay more amount',
      supply: new common.TokenAmount(sonne.optimismTokens.WETH, '100'),
      borrow: new common.TokenAmount(sonne.optimismTokens.WBTC, '1'),
      repay: new common.TokenAmount(sonne.optimismTokens.WBTC, '2'),
    },
    {
      title: 'Native: repay more amount',
      supply: new common.TokenAmount(sonne.optimismTokens.WBTC, '1'),
      borrow: new common.TokenAmount(sonne.optimismTokens.WETH, '1'),
      repay: new common.TokenAmount(sonne.optimismTokens.ETH, '2'),
    },
  ];

  testCases.forEach(({ title, supply, borrow, repay, balanceBps }, i) => {
    it(`case ${i + 1}: ${title}`, async function () {
      // 1. supply, enterMarkets and borrow first
      await helpers.supply(chainId, user, supply);
      await helpers.enterMarkets(chainId, user, [supply.token]);
      await helpers.borrow(chainId, user, borrow);

      // 2. get borrow balance after 1000 blocks
      await hrehelpers.mine(1000);
      const sonneRepayLogic = new sonne.RepayLogic(chainId, hre.ethers.provider);
      const { input } = await sonneRepayLogic.quote({ borrower: user.address, tokenIn: repay.token });
      expect(input.amountWei).to.be.gt(borrow.amountWei);

      // 3. build input, funds, tokensReturn
      const funds = new common.TokenAmounts();
      if (balanceBps) {
        funds.add(utils.calcRequiredAmountByBalanceBps(repay, balanceBps));
      } else {
        funds.add(repay);
      }
      const tokensReturn = [repay.token.elasticAddress];

      // 4. build router logics
      const routerLogics: core.DataType.LogicStruct[] = [];
      routerLogics.push(await sonneRepayLogic.build({ input: repay, balanceBps, borrower: user.address }));

      // 5. get router permit2 datas
      const permit2Datas = await utils.getRouterPermit2Datas(chainId, user, funds.erc20);

      // 6. send router tx
      const routerKit = new core.RouterKit(chainId);
      const transactionRequest = routerKit.buildExecuteTransactionRequest({
        permit2Datas,
        routerLogics,
        tokensReturn,
        value: funds.native?.amountWei ?? 0,
      });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

      if (balanceBps === common.BPS_BASE || repay.amountWei.gte(input.amountWei)) {
        const borrowBalanceWei = await sonne.CErc20Immutable__factory.connect(
          sonne.toCToken(chainId, borrow.token).address,
          user
        ).callStatic.borrowBalanceCurrent(user.address);
        expect(borrowBalanceWei).to.eq(0);
        await expect(user.address).to.changeBalance(repay.token, -borrow.amount, 1);
      } else {
        await expect(user.address).to.changeBalance(repay.token, -repay.amount);
      }
    });
  });
});

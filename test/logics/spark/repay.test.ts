import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';
import * as spark from 'src/logics/spark';
import * as utils from 'test/utils';

describe('mainnet-pb: Test Spark Repay Logic', function () {
  let chainId: number;
  let users: SignerWithAddress[];

  before(async function () {
    chainId = await getChainId();
    const [, user1, user2] = await hre.ethers.getSigners();
    users = [user1, user2];
    await claimToken(chainId, user1.address, spark.mainnetTokens.wstETH, '20000');
    await claimToken(chainId, user1.address, spark.mainnetTokens.WETH, '100');
    await claimToken(chainId, user2.address, spark.mainnetTokens.wstETH, '100');
    await claimToken(chainId, user2.address, spark.mainnetTokens.WETH, '100');
    await claimToken(chainId, user2.address, spark.mainnetTokens.USDC, '100');
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      userIndex: 0,
      supply: new common.TokenAmount(spark.mainnetTokens.wstETH, '5000'),
      borrow: new common.TokenAmount(spark.mainnetTokens.ETH, '1'),
      interestRateMode: spark.InterestRateMode.variable,
    },
    {
      userIndex: 0,
      supply: new common.TokenAmount(spark.mainnetTokens.wstETH, '5000'),
      borrow: new common.TokenAmount(spark.mainnetTokens.WETH, '1'),
      interestRateMode: spark.InterestRateMode.variable,
    },
    {
      userIndex: 1,
      supply: new common.TokenAmount(spark.mainnetTokens.WETH, '1'),
      borrow: new common.TokenAmount(spark.mainnetTokens.USDC, '1'),
      interestRateMode: spark.InterestRateMode.variable,
    },
    {
      userIndex: 0,
      supply: new common.TokenAmount(spark.mainnetTokens.wstETH, '5000'),
      borrow: new common.TokenAmount(spark.mainnetTokens.ETH, '1'),
      interestRateMode: spark.InterestRateMode.variable,
      balanceBps: 5000,
    },
    {
      userIndex: 0,
      supply: new common.TokenAmount(spark.mainnetTokens.wstETH, '5000'),
      borrow: new common.TokenAmount(spark.mainnetTokens.WETH, '1'),
      interestRateMode: spark.InterestRateMode.variable,
      balanceBps: 5000,
    },
    {
      userIndex: 1,
      supply: new common.TokenAmount(spark.mainnetTokens.WETH, '1'),
      borrow: new common.TokenAmount(spark.mainnetTokens.USDC, '1'),
      interestRateMode: spark.InterestRateMode.variable,
      balanceBps: 5000,
    },
  ];

  testCases.forEach(({ userIndex, supply, borrow, interestRateMode, balanceBps }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. supply and borrow first
      const user = users[userIndex];
      await helpers.supply(chainId, user, supply);
      await helpers.borrow(chainId, user, borrow, interestRateMode);

      // 2. get user debt
      const sparkRepayLogic = new spark.RepayLogic(chainId, hre.ethers.provider);
      let quotation = await sparkRepayLogic.quote({ borrower: user.address, tokenIn: borrow.token, interestRateMode });
      const { input } = quotation;

      // 3. build funds and tokensReturn
      const funds = new common.TokenAmounts();
      if (balanceBps) {
        funds.add(utils.calcRequiredAmountByBalanceBps(input, balanceBps));
      } else {
        funds.add(input);
      }
      const tokensReturn = [input.token.elasticAddress];

      // 4. build router logics
      const routerLogics: core.DataType.LogicStruct[] = [];
      routerLogics.push(await sparkRepayLogic.build({ input, interestRateMode, borrower: user.address, balanceBps }));

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
      await expect(user.address).to.changeBalance(input.token, -input.amount, 200);

      // 7. check user's debt should be zero
      quotation = await sparkRepayLogic.quote({ borrower: user.address, tokenIn: borrow.token, interestRateMode });
      expect(quotation.input.amountWei).to.eq(0);
    });
  });
});

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';
import * as spark from 'src/logics/spark';

describe('mainnet: Test Spark Borrow Logic', function () {
  let chainId: number;
  let users: SignerWithAddress[];

  before(async function () {
    chainId = await getChainId();
    const [, user1, user2] = await hre.ethers.getSigners();
    users = [user1, user2];
    await claimToken(chainId, user1.address, spark.mainnetTokens.wstETH, '10000');
    await claimToken(chainId, user2.address, spark.mainnetTokens.WETH, '100');
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      userIndex: 0,
      supply: new common.TokenAmount(spark.mainnetTokens.wstETH, '5000'),
      output: new common.TokenAmount(spark.mainnetTokens.WETH, '1'),
      interestRateMode: spark.InterestRateMode.variable,
    },
    {
      userIndex: 0,
      supply: new common.TokenAmount(spark.mainnetTokens.wstETH, '5000'),
      output: new common.TokenAmount(spark.mainnetTokens.ETH, '1'),
      interestRateMode: spark.InterestRateMode.variable,
    },
    {
      userIndex: 1,
      supply: new common.TokenAmount(spark.mainnetTokens.WETH, '1'),
      output: new common.TokenAmount(spark.mainnetTokens.USDC, '1'),
      interestRateMode: spark.InterestRateMode.variable,
    },
  ];

  testCases.forEach(({ userIndex, supply, output, interestRateMode }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. supply and approve delegation
      const user = users[userIndex];
      await helpers.supply(chainId, user, supply);
      await helpers.approveDelegation(chainId, user, output, interestRateMode);

      // 2. build tokensReturn
      const tokensReturn = [output.token.elasticAddress];

      // 3. build router logics
      const routerLogics: core.DataType.LogicStruct[] = [];

      const sparkBorrowLogic = new spark.BorrowLogic(chainId);
      routerLogics.push(await sparkBorrowLogic.build({ output, interestRateMode }, { account: user.address }));

      // 4. send router tx
      const routerKit = new core.RouterKit(chainId);
      const transactionRequest = routerKit.buildExecuteTransactionRequest({ routerLogics, tokensReturn });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
      await expect(user.address).to.changeBalance(output.token, output.amount);
    });
  });
});

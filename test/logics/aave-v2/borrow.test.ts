import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as aavev2 from 'src/logics/aave-v2';
import { claimToken, getChainId, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';

describe('Test AaveV2 Borrow Logic', function () {
  let chainId: number;
  let users: SignerWithAddress[];

  before(async function () {
    chainId = await getChainId();
    const [, user1, user2] = await hre.ethers.getSigners();
    users = [user1, user2];
    await claimToken(chainId, user1.address, mainnetTokens.USDC, '20000');
    await claimToken(chainId, user2.address, mainnetTokens.WETH, '100');
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      userIndex: 0,
      deposit: new common.TokenAmount(aavev2.mainnetTokens.USDC, '5000'),
      output: new common.TokenAmount(aavev2.mainnetTokens.WETH, '1'),
      interestRateMode: aavev2.InterestRateMode.variable,
    },
    {
      userIndex: 0,
      deposit: new common.TokenAmount(aavev2.mainnetTokens.USDC, '5000'),
      output: new common.TokenAmount(aavev2.mainnetTokens.ETH, '1'),
      interestRateMode: aavev2.InterestRateMode.variable,
    },
    {
      userIndex: 0,
      deposit: new common.TokenAmount(aavev2.mainnetTokens.USDC, '5000'),
      output: new common.TokenAmount(aavev2.mainnetTokens.WETH, '1'),
      interestRateMode: aavev2.InterestRateMode.stable,
    },
    {
      userIndex: 0,
      deposit: new common.TokenAmount(aavev2.mainnetTokens.USDC, '5000'),
      output: new common.TokenAmount(aavev2.mainnetTokens.ETH, '1'),
      interestRateMode: aavev2.InterestRateMode.stable,
    },
    {
      userIndex: 1,
      deposit: new common.TokenAmount(aavev2.mainnetTokens.WETH, '1'),
      output: new common.TokenAmount(aavev2.mainnetTokens.USDC, '1'),
      interestRateMode: aavev2.InterestRateMode.variable,
    },
    {
      userIndex: 1,
      deposit: new common.TokenAmount(aavev2.mainnetTokens.WETH, '1'),
      output: new common.TokenAmount(aavev2.mainnetTokens.USDC, '1'),
      interestRateMode: aavev2.InterestRateMode.stable,
    },
  ];

  testCases.forEach(({ userIndex, deposit, output, interestRateMode }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. deposit and approve delegation
      const user = users[userIndex];
      await helpers.deposit(chainId, user, deposit);
      await helpers.approveDelegation(chainId, user, output, interestRateMode);

      // 2. build tokensReturn
      const tokensReturn = [output.token.elasticAddress];

      // 3. build router logics
      const routerLogics: core.IParam.LogicStruct[] = [];
      const logicAaveV2Borrow = new aavev2.BorrowLogic(chainId);
      routerLogics.push(await logicAaveV2Borrow.build({ output, interestRateMode }, { account: user.address }));

      // 4. send router tx
      const transactionRequest = core.newRouterExecuteTransactionRequest({ chainId, routerLogics, tokensReturn });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
      await expect(user.address).to.changeBalance(output.token, output.amount);
    });
  });
});

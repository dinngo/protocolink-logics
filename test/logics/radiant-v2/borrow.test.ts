import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';
import * as radiantv2 from 'src/logics/radiant-v2';

describe.skip('mainnet-pb: Test RadiantV2 Borrow Logic', () => {
  let chainId: number;
  let users: SignerWithAddress[];

  before(async () => {
    chainId = await getChainId();
    const [, user1, user2] = await hre.ethers.getSigners();
    users = [user1, user2];
    await claimToken(chainId, user1.address, common.mainnetTokens.USDC, '20000');
    await claimToken(chainId, user2.address, common.mainnetTokens.WETH, '100');
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      userIndex: 0,
      deposit: new common.TokenAmount(common.mainnetTokens.USDC, '5000'),
      output: new common.TokenAmount(common.mainnetTokens.WETH, '1'),
      interestRateMode: radiantv2.InterestRateMode.variable,
    },
    {
      userIndex: 0,
      deposit: new common.TokenAmount(common.mainnetTokens.USDC, '5000'),
      output: new common.TokenAmount(common.mainnetTokens.ETH, '1'),
      interestRateMode: radiantv2.InterestRateMode.variable,
    },
    {
      userIndex: 1,
      deposit: new common.TokenAmount(common.mainnetTokens.WETH, '1'),
      output: new common.TokenAmount(common.mainnetTokens.USDC, '1'),
      interestRateMode: radiantv2.InterestRateMode.variable,
    },
    {
      userIndex: 1,
      deposit: new common.TokenAmount(common.mainnetTokens.WETH, '1'),
      output: new common.TokenAmount(common.mainnetTokens.USDT, '10'),
      interestRateMode: radiantv2.InterestRateMode.variable,
    },
  ];

  testCases.forEach(({ userIndex, deposit, output, interestRateMode }, i) => {
    it(`case ${i + 1}`, async () => {
      // 1. deposit and approve delegation
      const user = users[userIndex];
      await helpers.deposit(chainId, user, deposit);
      await helpers.approveDelegation(chainId, user, output, interestRateMode);

      // 2. build tokensReturn
      const tokensReturn = [output.token.elasticAddress];

      // 3. build router logics
      const routerLogics: core.DataType.LogicStruct[] = [];
      const radiantV2BorrowLogic = new radiantv2.BorrowLogic(chainId);
      routerLogics.push(await radiantV2BorrowLogic.build({ output, interestRateMode }, { account: user.address }));

      // 4. send router tx
      const routerKit = new core.RouterKit(chainId);
      const transactionRequest = routerKit.buildExecuteTransactionRequest({ routerLogics, tokensReturn });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
      await expect(user.address).to.changeBalance(output.token, output.amount);
    });
  });
});

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';
import * as iolend from 'src/logics/iolend';

describe('iota-pb: Test Iolend Borrow Logic', () => {
  let chainId: number;
  let users: SignerWithAddress[];

  before(async () => {
    chainId = await getChainId();
    const [, user1, user2] = await hre.ethers.getSigners();
    users = [user1, user2];
    await claimToken(
      chainId,
      user1.address,
      common.iotaTokens.USDT,
      '5000',
      '0x7fA6e7C26Fac91541306B0240f930599F6e1D041'
    );
    await claimToken(
      chainId,
      user2.address,
      common.iotaTokens.wIOTA,
      '10000',
      '0x260817581206317e2665080a2e66854e922269d0'
    );
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      userIndex: 0,
      deposit: new common.TokenAmount(common.iotaTokens.USDT, '1000'),
      output: new common.TokenAmount(common.iotaTokens.wIOTA, '100'),
      interestRateMode: iolend.InterestRateMode.variable,
    },
    {
      userIndex: 0,
      deposit: new common.TokenAmount(common.iotaTokens.USDT, '1000'),
      output: new common.TokenAmount(common.iotaTokens.IOTA, '100'),
      interestRateMode: iolend.InterestRateMode.variable,
    },
    {
      userIndex: 1,
      deposit: new common.TokenAmount(common.iotaTokens.wIOTA, '1000'),
      output: new common.TokenAmount(common.iotaTokens.USDT, '10'),
      interestRateMode: iolend.InterestRateMode.variable,
    },
    {
      userIndex: 1,
      deposit: new common.TokenAmount(common.iotaTokens.wIOTA, '10000'),
      output: new common.TokenAmount(common.iotaTokens.USDT, '100'),
      interestRateMode: iolend.InterestRateMode.variable,
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
      const iolendBorrowLogic = new iolend.BorrowLogic(chainId);
      routerLogics.push(await iolendBorrowLogic.build({ output, interestRateMode }, { account: user.address }));

      // 4. send router tx
      const routerKit = new core.RouterKit(chainId);
      const transactionRequest = routerKit.buildExecuteTransactionRequest({ routerLogics, tokensReturn });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
      await expect(user.address).to.changeBalance(output.token, output.amount);
    });
  });
});

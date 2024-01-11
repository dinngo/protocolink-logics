import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as aavev3 from 'src/logics/aave-v3';
import { claimToken, getChainId, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';

describe('mainnet-pb: Test AaveV3 Borrow Logic', function () {
  let chainId: number;
  let users: SignerWithAddress[];

  before(async function () {
    chainId = await getChainId();
    const [, user1, user2] = await hre.ethers.getSigners();
    users = [user1, user2];
    await claimToken(chainId, user1.address, mainnetTokens.USDC, '10000');
    await claimToken(chainId, user2.address, mainnetTokens.WETH, '100');
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      userIndex: 0,
      supply: new common.TokenAmount(aavev3.mainnetTokens.USDC, '5000'),
      output: new common.TokenAmount(aavev3.mainnetTokens.WETH, '1'),
      interestRateMode: aavev3.InterestRateMode.variable,
    },
    {
      userIndex: 0,
      supply: new common.TokenAmount(aavev3.mainnetTokens.USDC, '5000'),
      output: new common.TokenAmount(aavev3.mainnetTokens.ETH, '1'),
      interestRateMode: aavev3.InterestRateMode.variable,
    },
    {
      userIndex: 1,
      supply: new common.TokenAmount(aavev3.mainnetTokens.WETH, '1'),
      output: new common.TokenAmount(aavev3.mainnetTokens.USDC, '1'),
      interestRateMode: aavev3.InterestRateMode.variable,
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

      const aaveV3BorrowLogic = new aavev3.BorrowLogic(chainId);
      routerLogics.push(await aaveV3BorrowLogic.build({ output, interestRateMode }, { account: user.address }));

      // 4. send router tx
      const routerKit = new core.RouterKit(chainId);
      const transactionRequest = routerKit.buildExecuteTransactionRequest({ routerLogics, tokensReturn });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
      await expect(user.address).to.changeBalance(output.token, output.amount);
    });
  });
});

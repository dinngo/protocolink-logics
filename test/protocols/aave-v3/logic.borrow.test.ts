import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, mainnetTokens } from '@composable-router/test-helpers';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';
import * as protocols from 'src/protocols';

describe('Test AaveV3 Borrow Logic', function () {
  let chainId: number;
  let users: SignerWithAddress[];

  before(async function () {
    chainId = await getChainId();
    const [, user1, user2] = await hre.ethers.getSigners();
    users = [user1, user2];
    await claimToken(chainId, user1.address, mainnetTokens.USDC, '10000');
    await claimToken(chainId, user2.address, mainnetTokens.WETH, '100');
  });

  const testCases = [
    {
      userIndex: 0,
      supply: new common.TokenAmount(protocols.aavev3.mainnetTokens.USDC, '5000'),
      output: new common.TokenAmount(protocols.aavev3.mainnetTokens.WETH, '1'),
      interestRateMode: protocols.aavev3.InterestRateMode.variable,
    },
    {
      userIndex: 0,
      supply: new common.TokenAmount(protocols.aavev3.mainnetTokens.USDC, '5000'),
      output: new common.TokenAmount(protocols.aavev3.mainnetTokens.ETH, '1'),
      interestRateMode: protocols.aavev3.InterestRateMode.variable,
    },
    {
      userIndex: 1,
      supply: new common.TokenAmount(protocols.aavev3.mainnetTokens.WETH, '1'),
      output: new common.TokenAmount(protocols.aavev3.mainnetTokens.USDC, '1'),
      interestRateMode: protocols.aavev3.InterestRateMode.variable,
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
      const routerLogics: core.IParam.LogicStruct[] = [];

      const aaveV3Borrow = new protocols.aavev3.BorrowLogic(chainId);
      routerLogics.push(await aaveV3Borrow.getLogic({ output, interestRateMode }, { account: user.address }));

      // 4. send router tx
      const transactionRequest = core.newRouterExecuteTransactionRequest({ chainId, routerLogics, tokensReturn });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
      await expect(user.address).to.changeBalance(output.token, output.amount);
    });
  });
});

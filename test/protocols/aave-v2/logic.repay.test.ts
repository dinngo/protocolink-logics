import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, mainnetTokens } from '@composable-router/test-helpers';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';
import * as protocols from 'src/protocols';
import * as utils from 'test/utils';

describe('Test AaveV2 Repay Logic', function () {
  let chainId: number;
  let users: SignerWithAddress[];

  before(async function () {
    chainId = await getChainId();
    const [, user1, user2, user3] = await hre.ethers.getSigners();
    users = [user1, user2, user3];
    await claimToken(chainId, user1.address, mainnetTokens.USDC, '20000');
    await claimToken(chainId, user1.address, mainnetTokens.WETH, '100');
    await claimToken(chainId, user2.address, mainnetTokens.USDC, '100');
    await claimToken(chainId, user2.address, mainnetTokens.WETH, '100');
  });

  const testCases = [
    {
      userIndex: 0,
      deposit: new common.TokenAmount(protocols.aavev2.mainnetTokens.USDC, '5000'),
      borrow: new common.TokenAmount(protocols.aavev2.mainnetTokens.WETH, '1'),
      interestRateMode: protocols.aavev2.InterestRateMode.variable,
    },
    {
      userIndex: 0,
      deposit: new common.TokenAmount(protocols.aavev2.mainnetTokens.USDC, '5000'),
      borrow: new common.TokenAmount(protocols.aavev2.mainnetTokens.WETH, '1'),
      interestRateMode: protocols.aavev2.InterestRateMode.stable,
    },
    {
      userIndex: 1,
      deposit: new common.TokenAmount(protocols.aavev2.mainnetTokens.WETH, '1'),
      borrow: new common.TokenAmount(protocols.aavev2.mainnetTokens.USDC, '1'),
      interestRateMode: protocols.aavev2.InterestRateMode.variable,
    },
    {
      userIndex: 1,
      deposit: new common.TokenAmount(protocols.aavev2.mainnetTokens.WETH, '1'),
      borrow: new common.TokenAmount(protocols.aavev2.mainnetTokens.USDC, '1'),
      interestRateMode: protocols.aavev2.InterestRateMode.stable,
    },
    {
      userIndex: 0,
      deposit: new common.TokenAmount(protocols.aavev2.mainnetTokens.USDC, '5000'),
      borrow: new common.TokenAmount(protocols.aavev2.mainnetTokens.WETH, '1'),
      interestRateMode: protocols.aavev2.InterestRateMode.variable,
      amountBps: 5000,
    },
    {
      userIndex: 0,
      deposit: new common.TokenAmount(protocols.aavev2.mainnetTokens.USDC, '5000'),
      borrow: new common.TokenAmount(protocols.aavev2.mainnetTokens.WETH, '1'),
      interestRateMode: protocols.aavev2.InterestRateMode.stable,
      amountBps: 5000,
    },
    {
      userIndex: 1,
      deposit: new common.TokenAmount(protocols.aavev2.mainnetTokens.WETH, '1'),
      borrow: new common.TokenAmount(protocols.aavev2.mainnetTokens.USDC, '1'),
      interestRateMode: protocols.aavev2.InterestRateMode.variable,
      amountBps: 5000,
    },
    {
      userIndex: 1,
      deposit: new common.TokenAmount(protocols.aavev2.mainnetTokens.WETH, '1'),
      borrow: new common.TokenAmount(protocols.aavev2.mainnetTokens.USDC, '1'),
      interestRateMode: protocols.aavev2.InterestRateMode.stable,
      amountBps: 5000,
    },
  ];

  testCases.forEach(({ userIndex, deposit, borrow, interestRateMode, amountBps }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. deposit and borrow first
      const user = users[userIndex];
      await helpers.deposit(chainId, user, deposit);
      await helpers.borrow(chainId, user, borrow, interestRateMode);

      // 2. get user debt
      const aaveV2Repay = new protocols.aavev2.RepayLogic(chainId, hre.ethers.provider);
      let debt = await aaveV2Repay.getDebt(user.address, borrow.token, interestRateMode);

      // 3. build funds and tokensReturn
      const input = debt;
      const funds = new common.TokenAmounts();
      if (amountBps) {
        funds.add(utils.calcRequiredFundByAmountBps(input, amountBps));
      } else {
        funds.add(input);
      }
      const tokensReturn = [input.token.elasticAddress];

      // 4. build router logics
      const erc20Funds = funds.erc20;
      const routerLogics = await utils.getPermitAndPullTokenRouterLogics(chainId, user, erc20Funds);

      routerLogics.push(await aaveV2Repay.getLogic({ input, interestRateMode, address: user.address, amountBps }));

      // 5. send router tx
      const transactionRequest = core.newRouterExecuteTransactionRequest({ chainId, routerLogics, tokensReturn });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
      await expect(user.address).to.changeBalance(input.token, -input.amount, 100);

      // 6. check user's debt should be zero
      debt = await aaveV2Repay.getDebt(user.address, borrow.token, interestRateMode);
      expect(debt.amountWei).to.eq(0);
    });
  });
});

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as aavev2 from 'src/aave-v2';
import {
  claimToken,
  getChainId,
  mainnetTokens,
  snapshotAndRevertEach,
} from '@furucombo/composable-router-test-helpers';
import * as common from '@furucombo/composable-router-common';
import * as core from '@furucombo/composable-router-core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';
import * as utils from 'test/utils';

describe('Test AaveV2 Repay Logic', function () {
  let chainId: number;
  let users: SignerWithAddress[];

  before(async function () {
    chainId = await getChainId();
    const [, user1, user2] = await hre.ethers.getSigners();
    users = [user1, user2];
    await claimToken(chainId, user1.address, mainnetTokens.USDC, '40000');
    await claimToken(chainId, user1.address, mainnetTokens.WETH, '100');
    await claimToken(chainId, user2.address, mainnetTokens.USDC, '100');
    await claimToken(chainId, user2.address, mainnetTokens.WETH, '100');
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      userIndex: 0,
      deposit: new common.TokenAmount(aavev2.mainnetTokens.USDC, '5000'),
      borrow: new common.TokenAmount(aavev2.mainnetTokens.ETH, '1'),
      interestRateMode: aavev2.InterestRateMode.variable,
    },
    {
      userIndex: 0,
      deposit: new common.TokenAmount(aavev2.mainnetTokens.USDC, '5000'),
      borrow: new common.TokenAmount(aavev2.mainnetTokens.ETH, '1'),
      interestRateMode: aavev2.InterestRateMode.stable,
    },
    {
      userIndex: 0,
      deposit: new common.TokenAmount(aavev2.mainnetTokens.USDC, '5000'),
      borrow: new common.TokenAmount(aavev2.mainnetTokens.WETH, '1'),
      interestRateMode: aavev2.InterestRateMode.variable,
    },
    {
      userIndex: 0,
      deposit: new common.TokenAmount(aavev2.mainnetTokens.USDC, '5000'),
      borrow: new common.TokenAmount(aavev2.mainnetTokens.WETH, '1'),
      interestRateMode: aavev2.InterestRateMode.stable,
    },
    {
      userIndex: 1,
      deposit: new common.TokenAmount(aavev2.mainnetTokens.WETH, '1'),
      borrow: new common.TokenAmount(aavev2.mainnetTokens.USDC, '1'),
      interestRateMode: aavev2.InterestRateMode.variable,
    },
    {
      userIndex: 1,
      deposit: new common.TokenAmount(aavev2.mainnetTokens.WETH, '1'),
      borrow: new common.TokenAmount(aavev2.mainnetTokens.USDC, '1'),
      interestRateMode: aavev2.InterestRateMode.stable,
    },
    {
      userIndex: 0,
      deposit: new common.TokenAmount(aavev2.mainnetTokens.USDC, '5000'),
      borrow: new common.TokenAmount(aavev2.mainnetTokens.ETH, '1'),
      interestRateMode: aavev2.InterestRateMode.variable,
      balanceBps: 5000,
    },
    {
      userIndex: 0,
      deposit: new common.TokenAmount(aavev2.mainnetTokens.USDC, '5000'),
      borrow: new common.TokenAmount(aavev2.mainnetTokens.ETH, '1'),
      interestRateMode: aavev2.InterestRateMode.stable,
      balanceBps: 5000,
    },
    {
      userIndex: 0,
      deposit: new common.TokenAmount(aavev2.mainnetTokens.USDC, '5000'),
      borrow: new common.TokenAmount(aavev2.mainnetTokens.WETH, '1'),
      interestRateMode: aavev2.InterestRateMode.variable,
      balanceBps: 5000,
    },
    {
      userIndex: 0,
      deposit: new common.TokenAmount(aavev2.mainnetTokens.USDC, '5000'),
      borrow: new common.TokenAmount(aavev2.mainnetTokens.WETH, '1'),
      interestRateMode: aavev2.InterestRateMode.stable,
      balanceBps: 5000,
    },
    {
      userIndex: 1,
      deposit: new common.TokenAmount(aavev2.mainnetTokens.WETH, '1'),
      borrow: new common.TokenAmount(aavev2.mainnetTokens.USDC, '1'),
      interestRateMode: aavev2.InterestRateMode.variable,
      balanceBps: 5000,
    },
    {
      userIndex: 1,
      deposit: new common.TokenAmount(aavev2.mainnetTokens.WETH, '1'),
      borrow: new common.TokenAmount(aavev2.mainnetTokens.USDC, '1'),
      interestRateMode: aavev2.InterestRateMode.stable,
      balanceBps: 5000,
    },
  ];

  testCases.forEach(({ userIndex, deposit, borrow, interestRateMode, balanceBps }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. deposit and borrow first
      const user = users[userIndex];
      await helpers.deposit(chainId, user, deposit);
      await helpers.borrow(chainId, user, borrow, interestRateMode);

      // 2. get user debt
      const logicAaveV2Repay = new aavev2.RepayLogic(chainId, hre.ethers.provider);
      let quotation = await logicAaveV2Repay.quote({ borrower: user.address, tokenIn: borrow.token, interestRateMode });
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
      const erc20Funds = funds.erc20;
      const routerLogics = await utils.getPermitAndPullTokenRouterLogics(chainId, user, erc20Funds);

      routerLogics.push(await logicAaveV2Repay.build({ input, interestRateMode, borrower: user.address, balanceBps }));

      // 5. send router tx
      const transactionRequest = core.newRouterExecuteTransactionRequest({
        chainId,
        routerLogics,
        tokensReturn,
        value: funds.native?.amountWei ?? 0,
      });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
      await expect(user.address).to.changeBalance(input.token, -input.amount, 200);

      // 6. check user's debt should be zero
      quotation = await logicAaveV2Repay.quote({ borrower: user.address, tokenIn: borrow.token, interestRateMode });
      expect(quotation.input.amountWei).to.eq(0);
    });
  });
});

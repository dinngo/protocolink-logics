import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as aavev3 from 'src/logics/aave-v3';
import { claimToken, getChainId, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';
import * as utils from 'test/utils';

describe('mainnet-pb: Test AaveV3 Repay Logic', function () {
  let chainId: number;
  let users: SignerWithAddress[];

  before(async function () {
    chainId = await getChainId();
    const [, user1, user2] = await hre.ethers.getSigners();
    users = [user1, user2];
    await claimToken(chainId, user1.address, common.mainnetTokens.USDC, '20000');
    await claimToken(chainId, user1.address, common.mainnetTokens.WETH, '100');
    await claimToken(chainId, user2.address, common.mainnetTokens.USDC, '100');
    await claimToken(chainId, user2.address, common.mainnetTokens.WETH, '100');
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      userIndex: 0,
      supply: new common.TokenAmount(aavev3.mainnetTokens.USDC, '5000'),
      borrow: new common.TokenAmount(aavev3.mainnetTokens.ETH, '1'),
      interestRateMode: aavev3.InterestRateMode.variable,
    },
    {
      userIndex: 0,
      supply: new common.TokenAmount(aavev3.mainnetTokens.USDC, '5000'),
      borrow: new common.TokenAmount(aavev3.mainnetTokens.WETH, '1'),
      interestRateMode: aavev3.InterestRateMode.variable,
    },
    {
      userIndex: 1,
      supply: new common.TokenAmount(aavev3.mainnetTokens.WETH, '1'),
      borrow: new common.TokenAmount(aavev3.mainnetTokens.USDC, '1'),
      interestRateMode: aavev3.InterestRateMode.variable,
    },
    {
      userIndex: 0,
      supply: new common.TokenAmount(aavev3.mainnetTokens.USDC, '5000'),
      borrow: new common.TokenAmount(aavev3.mainnetTokens.ETH, '1'),
      interestRateMode: aavev3.InterestRateMode.variable,
      balanceBps: 5000,
    },
    {
      userIndex: 0,
      supply: new common.TokenAmount(aavev3.mainnetTokens.USDC, '5000'),
      borrow: new common.TokenAmount(aavev3.mainnetTokens.WETH, '1'),
      interestRateMode: aavev3.InterestRateMode.variable,
      balanceBps: 5000,
    },
    {
      userIndex: 1,
      supply: new common.TokenAmount(aavev3.mainnetTokens.WETH, '1'),
      borrow: new common.TokenAmount(aavev3.mainnetTokens.USDC, '1'),
      interestRateMode: aavev3.InterestRateMode.variable,
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
      const aaveV3RepayLogic = new aavev3.RepayLogic(chainId, hre.ethers.provider);
      let quotation = await aaveV3RepayLogic.quote({ borrower: user.address, tokenIn: borrow.token, interestRateMode });
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
      routerLogics.push(await aaveV3RepayLogic.build({ input, interestRateMode, borrower: user.address, balanceBps }));

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
      quotation = await aaveV3RepayLogic.quote({ borrower: user.address, tokenIn: borrow.token, interestRateMode });
      expect(quotation.input.amountWei).to.eq(0);
    });
  });
});

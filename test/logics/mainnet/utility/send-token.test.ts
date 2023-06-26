import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import {
  claimToken,
  getChainId,
  mainnetTokens,
  snapshotAndRevertEach,
} from '@furucombo/composable-router-test-helpers';
import * as common from '@furucombo/composable-router-common';
import * as core from '@furucombo/composable-router-core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as utility from 'src/logics/utility';
import * as utils from 'test/utils';

describe('Test Utility SendToken Logic', function () {
  let chainId: number;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  before(async function () {
    chainId = await getChainId();
    [, user1, user2] = await hre.ethers.getSigners();
    await claimToken(chainId, user1.address, mainnetTokens.WETH, '100');
    await claimToken(chainId, user1.address, mainnetTokens.USDC, '100');
  });

  snapshotAndRevertEach();

  const testCases = [
    { input: new common.TokenAmount(mainnetTokens.ETH, '1') },
    { input: new common.TokenAmount(mainnetTokens.WETH, '1') },
    { input: new common.TokenAmount(mainnetTokens.USDC, '1') },
    { input: new common.TokenAmount(mainnetTokens.ETH, '1'), balanceBps: 5000 },
    { input: new common.TokenAmount(mainnetTokens.WETH, '1'), balanceBps: 5000 },
    { input: new common.TokenAmount(mainnetTokens.USDC, '1'), balanceBps: 5000 },
  ];

  testCases.forEach(({ input, balanceBps }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. build funds, tokensReturn
      const tokensReturn = [];
      const funds = new common.TokenAmounts();
      if (balanceBps) {
        funds.add(utils.calcRequiredAmountByBalanceBps(input, balanceBps));
        tokensReturn.push(input.token.elasticAddress);
      } else {
        funds.add(input);
      }

      // 2. build router logics
      const erc20Funds = funds.erc20;
      const routerLogics = await utils.getPermitAndPullTokenRouterLogics(chainId, user1, erc20Funds);

      const logicUtilitySendToken = new utility.SendTokenLogic(chainId);
      routerLogics.push(await logicUtilitySendToken.build({ input, recipient: user2.address }));

      // 3. send router tx
      const transactionRequest = core.newRouterExecuteTransactionRequest({
        chainId,
        routerLogics,
        tokensReturn,
        value: funds.native?.amountWei ?? 0,
      });
      await expect(user1.sendTransaction(transactionRequest)).to.not.be.reverted;
      await expect(user1.address).to.changeBalance(input.token, -input.amount);
      await expect(user2.address).to.changeBalance(input.token, input.amount);
    });
  });
});

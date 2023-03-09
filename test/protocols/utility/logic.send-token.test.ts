import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, mainnetTokens } from '@composable-router/test-helpers';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as protocols from 'src/protocols';
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

  const testCases = [
    { input: new common.TokenAmount(mainnetTokens.WETH, '1') },
    { input: new common.TokenAmount(mainnetTokens.USDC, '1') },
    { input: new common.TokenAmount(mainnetTokens.WETH, '1'), amountBps: 5000 },
    { input: new common.TokenAmount(mainnetTokens.USDC, '1'), amountBps: 5000 },
  ];

  testCases.forEach(({ input, amountBps }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. build funds, tokensReturn
      const tokensReturn = [];
      const funds = new common.TokenAmounts();
      if (amountBps) {
        funds.add(utils.calcRequiredFundByAmountBps(input, amountBps));
        tokensReturn.push(input.token.elasticAddress);
      } else {
        funds.add(input);
      }

      // 2. build router logics
      const erc20Funds = funds.erc20;
      const routerLogics = await utils.getPermitAndPullTokenRouterLogics(chainId, user1, erc20Funds);

      const utilitySendTokenLogic = new protocols.utility.SendTokenLogic(chainId);
      routerLogics.push(await utilitySendTokenLogic.getLogic({ input, recipient: user2.address }));

      // 3. send router tx
      const transactionRequest = core.newRouterExecuteTransactionRequest({
        chainId,
        routerLogics,
        tokensReturn,
        value: funds.native?.amountWei ?? 0,
      });
      await expect(user1.sendTransaction(transactionRequest)).not.to.be.reverted;
      await expect(user1.address).to.changeBalance(input.token, -input.amount);
      await expect(user2.address).to.changeBalance(input.token, input.amount);
    });
  });
});

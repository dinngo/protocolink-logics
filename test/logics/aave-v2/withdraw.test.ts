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

describe('Test AaveV2 Withdraw Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    await claimToken(chainId, user.address, mainnetTokens.WETH, '100');
    await claimToken(chainId, user.address, mainnetTokens.USDC, '100');
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      input: new common.TokenAmount(aavev2.mainnetTokens.aWETH, '1'),
      tokenOut: aavev2.mainnetTokens.ETH,
    },
    {
      input: new common.TokenAmount(aavev2.mainnetTokens.aWETH, '1'),
      tokenOut: aavev2.mainnetTokens.WETH,
    },
    {
      input: new common.TokenAmount(aavev2.mainnetTokens.aUSDC, '1'),
      tokenOut: aavev2.mainnetTokens.USDC,
    },
    {
      input: new common.TokenAmount(aavev2.mainnetTokens.aWETH, '1'),
      tokenOut: aavev2.mainnetTokens.ETH,
      amountBps: 5000,
    },
    {
      input: new common.TokenAmount(aavev2.mainnetTokens.aWETH, '1'),
      tokenOut: aavev2.mainnetTokens.WETH,
      amountBps: 5000,
    },
    {
      input: new common.TokenAmount(aavev2.mainnetTokens.aUSDC, '1'),
      tokenOut: aavev2.mainnetTokens.USDC,
      amountBps: 5000,
    },
  ];

  testCases.forEach(({ input, tokenOut, amountBps }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. deposit first
      const assetsAmount = new common.TokenAmount(tokenOut, '3');
      await helpers.deposit(chainId, user, assetsAmount);

      // 2. get output
      const logicAaveV2Withdraw = new aavev2.WithdrawLogic(chainId);
      const { output } = await logicAaveV2Withdraw.quote({ input, tokenOut });

      // 3. build funds, tokensReturn
      const tokensReturn = [output.token.elasticAddress];
      const funds = new common.TokenAmounts();
      if (amountBps) {
        funds.add(utils.calcRequiredAmountByAmountBps(input, amountBps));
        tokensReturn.push(input.token.elasticAddress);
      } else {
        funds.add(input);
      }

      // 4. build router logics
      const erc20Funds = funds.erc20;
      const routerLogics = await utils.getPermitAndPullTokenRouterLogics(chainId, user, erc20Funds);
      routerLogics.push(await logicAaveV2Withdraw.build({ input, output, amountBps }, { account: user.address }));

      // 5. send router tx
      const transactionRequest = core.newRouterExecuteTransactionRequest({ chainId, routerLogics, tokensReturn });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
      await expect(user.address).to.changeBalance(input.token, -input.amount, 1);
      await expect(user.address).to.changeBalance(output.token, output.amount);
    });
  });
});

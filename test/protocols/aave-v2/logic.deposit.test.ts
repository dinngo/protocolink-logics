import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, mainnetTokens } from '@composable-router/test-helpers';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as protocols from 'src/protocols';
import * as utils from 'test/utils';

describe('Test AaveV2 Deposit Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    await claimToken(chainId, user.address, mainnetTokens.ETH, '100');
    await claimToken(chainId, user.address, mainnetTokens.USDC, '100');
    await claimToken(chainId, user.address, mainnetTokens.WETH, '100');
  });

  const testCases = [
    {
      input: new common.TokenAmount(protocols.aavev2.mainnetTokens.WETH, '1'),
      tokenOut: protocols.aavev2.mainnetTokens.aWETH,
    },
    {
      input: new common.TokenAmount(protocols.aavev2.mainnetTokens.USDC, '1'),
      tokenOut: protocols.aavev2.mainnetTokens.aUSDC,
    },
    {
      input: new common.TokenAmount(protocols.aavev2.mainnetTokens.WETH, '1'),
      tokenOut: protocols.aavev2.mainnetTokens.aWETH,
      amountBps: 5000,
    },
    {
      input: new common.TokenAmount(protocols.aavev2.mainnetTokens.USDC, '1'),
      tokenOut: protocols.aavev2.mainnetTokens.aUSDC,
      amountBps: 5000,
    },
  ];

  testCases.forEach(({ input, tokenOut, amountBps }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. get output
      const aaveV2Deposit = new protocols.aavev2.DepositLogic(chainId);
      const { output } = await aaveV2Deposit.quote({ input, tokenOut });

      // 2. build funds, tokensReturn
      const tokensReturn = [output.token.elasticAddress];
      const funds = new common.TokenAmounts();
      if (amountBps) {
        funds.add(utils.calcRequiredFundByAmountBps(input, amountBps));
        tokensReturn.push(input.token.elasticAddress);
      } else {
        funds.add(input);
      }

      // 3. build router logics
      const erc20Funds = funds.erc20;
      const routerLogics = await utils.getPermitAndPullTokenRouterLogics(chainId, user, erc20Funds);
      routerLogics.push(await aaveV2Deposit.getLogic({ input, output, amountBps }, { account: user.address }));

      // 4. send router tx
      const transactionRequest = core.newRouterExecuteTransactionRequest({ chainId, routerLogics, tokensReturn });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
      await expect(user.address).to.changeBalance(input.token, -input.amount);
      await expect(user.address).to.changeBalance(output.token, output.amount, 1);
    });
  });
});

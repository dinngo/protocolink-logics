import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as aavev2 from 'src/logics/aave-v2';
import { claimToken, getChainId, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as utils from 'test/utils';

describe('Test AaveV2 Deposit Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    await claimToken(chainId, user.address, mainnetTokens.USDC, '100');
    await claimToken(chainId, user.address, mainnetTokens.WETH, '100');
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      input: new common.TokenAmount(aavev2.mainnetTokens.ETH, '1'),
      tokenOut: aavev2.mainnetTokens.aWETH,
    },
    {
      input: new common.TokenAmount(aavev2.mainnetTokens.WETH, '1'),
      tokenOut: aavev2.mainnetTokens.aWETH,
    },
    {
      input: new common.TokenAmount(aavev2.mainnetTokens.USDC, '1'),
      tokenOut: aavev2.mainnetTokens.aUSDC,
    },
    {
      input: new common.TokenAmount(aavev2.mainnetTokens.ETH, '1'),
      tokenOut: aavev2.mainnetTokens.aWETH,
      balanceBps: 5000,
    },
    {
      input: new common.TokenAmount(aavev2.mainnetTokens.WETH, '1'),
      tokenOut: aavev2.mainnetTokens.aWETH,
      balanceBps: 5000,
    },
    {
      input: new common.TokenAmount(aavev2.mainnetTokens.USDC, '1'),
      tokenOut: aavev2.mainnetTokens.aUSDC,
      balanceBps: 5000,
    },
  ];

  testCases.forEach(({ input, tokenOut, balanceBps }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. get output
      const logicAaveV2Deposit = new aavev2.DepositLogic(chainId);
      const { output } = await logicAaveV2Deposit.quote({ input, tokenOut });

      // 2. build funds, tokensReturn
      const tokensReturn = [output.token.elasticAddress];
      const funds = new common.TokenAmounts();
      if (balanceBps) {
        funds.add(utils.calcRequiredAmountByBalanceBps(input, balanceBps));
        tokensReturn.push(input.token.elasticAddress);
      } else {
        funds.add(input);
      }

      // 3. build router logics
      const erc20Funds = funds.erc20;
      const routerLogics = await utils.getPermitAndPullTokenRouterLogics(chainId, user, erc20Funds);
      routerLogics.push(await logicAaveV2Deposit.build({ input, output, balanceBps }, { account: user.address }));

      // 4. send router tx
      const transactionRequest = core.newRouterExecuteTransactionRequest({
        chainId,
        routerLogics,
        tokensReturn,
        value: funds.native?.amountWei ?? 0,
      });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
      await expect(user.address).to.changeBalance(input.token, -input.amount);
      await expect(user.address).to.changeBalance(output.token, output.amount, 1);
    });
  });
});

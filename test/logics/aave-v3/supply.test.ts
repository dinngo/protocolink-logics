import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as aavev3 from 'src/logics/aave-v3';
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
import * as utils from 'test/utils';

describe('Test AaveV3 Supply Logic', function () {
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
      input: new common.TokenAmount(aavev3.mainnetTokens.ETH, '1'),
      tokenOut: aavev3.mainnetTokens.aEthWETH,
    },
    {
      input: new common.TokenAmount(aavev3.mainnetTokens.WETH, '1'),
      tokenOut: aavev3.mainnetTokens.aEthWETH,
    },
    {
      input: new common.TokenAmount(aavev3.mainnetTokens.USDC, '1'),
      tokenOut: aavev3.mainnetTokens.aEthUSDC,
    },
    {
      input: new common.TokenAmount(aavev3.mainnetTokens.ETH, '1'),
      tokenOut: aavev3.mainnetTokens.aEthWETH,
      balanceBps: 5000,
    },
    {
      input: new common.TokenAmount(aavev3.mainnetTokens.WETH, '1'),
      tokenOut: aavev3.mainnetTokens.aEthWETH,
      balanceBps: 5000,
    },
    {
      input: new common.TokenAmount(aavev3.mainnetTokens.USDC, '1'),
      tokenOut: aavev3.mainnetTokens.aEthUSDC,
      balanceBps: 5000,
    },
  ];

  testCases.forEach(({ input, tokenOut, balanceBps }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. get output
      const logicAavev3Supply = new aavev3.SupplyLogic(chainId);
      const { output } = await logicAavev3Supply.quote({ input, tokenOut });

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
      routerLogics.push(await logicAavev3Supply.build({ input, output, balanceBps }, { account: user.address }));

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

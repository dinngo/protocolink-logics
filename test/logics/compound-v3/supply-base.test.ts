import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, snapshotAndRevertEach } from '@furucombo/composable-router-test-helpers';
import * as common from '@furucombo/composable-router-common';
import * as compoundv3 from 'src/compound-v3';
import * as core from '@furucombo/composable-router-core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as utils from 'test/utils';

describe('Test CompoundV3 SupplyBase Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    await claimToken(chainId, user.address, compoundv3.mainnetTokens.USDC, '1000');
    await claimToken(chainId, user.address, compoundv3.mainnetTokens.WETH, '10');
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      marketId: compoundv3.MarketId.USDC,
      input: new common.TokenAmount(compoundv3.mainnetTokens.USDC, '1'),
      tokenOut: compoundv3.mainnetTokens.cUSDCv3,
    },
    {
      marketId: compoundv3.MarketId.USDC,
      input: new common.TokenAmount(compoundv3.mainnetTokens.USDC, '1'),
      tokenOut: compoundv3.mainnetTokens.cUSDCv3,
      balanceBps: 5000,
    },
    {
      marketId: compoundv3.MarketId.ETH,
      input: new common.TokenAmount(compoundv3.mainnetTokens.ETH, '1'),
      tokenOut: compoundv3.mainnetTokens.cWETHv3,
    },
    {
      marketId: compoundv3.MarketId.ETH,
      input: new common.TokenAmount(compoundv3.mainnetTokens.ETH, '1'),
      tokenOut: compoundv3.mainnetTokens.cWETHv3,
      balanceBps: 5000,
    },
    {
      marketId: compoundv3.MarketId.ETH,
      input: new common.TokenAmount(compoundv3.mainnetTokens.WETH, '1'),
      tokenOut: compoundv3.mainnetTokens.cWETHv3,
    },
    {
      marketId: compoundv3.MarketId.ETH,
      input: new common.TokenAmount(compoundv3.mainnetTokens.WETH, '1'),
      tokenOut: compoundv3.mainnetTokens.cWETHv3,
      balanceBps: 5000,
    },
  ];

  testCases.forEach(({ marketId, input, tokenOut, balanceBps }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. get quotation
      const logicCompoundV3SupplyBase = new compoundv3.SupplyBaseLogic(chainId, hre.ethers.provider);
      const { output } = await logicCompoundV3SupplyBase.quote({ marketId, input, tokenOut });

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
      routerLogics.push(await logicCompoundV3SupplyBase.build({ marketId, input, output, balanceBps }));

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

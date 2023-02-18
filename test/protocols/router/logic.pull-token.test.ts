import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, mainnetTokens } from '@composable-router/test-helpers';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as utils from 'test/utils';

describe('Test Router Deposit Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    await claimToken(chainId, user.address, mainnetTokens.USDC, '100');
    await claimToken(chainId, user.address, mainnetTokens.WETH, '100');
  });

  const testCases = [
    { funds: new common.TokenAmounts([mainnetTokens.ETH, '1']) },
    { funds: new common.TokenAmounts([mainnetTokens.ETH, '1'], [mainnetTokens.WETH, '1']) },
    { funds: new common.TokenAmounts([mainnetTokens.ETH, '1'], [mainnetTokens.WETH, '1'], [mainnetTokens.USDC, '1']) },
    { funds: new common.TokenAmounts([mainnetTokens.WETH, '1'], [mainnetTokens.USDC, '1']) },
  ];

  testCases.forEach(({ funds }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. build tokensReturn
      const tokensReturn = funds.map((fund) => fund.token.elasticAddress);

      // 2. build router logics
      const erc20Funds = funds.erc20;
      const routerLogics = await utils.getPermitAndPullTokenRouterLogics(chainId, user, erc20Funds);

      // 3. send router tx
      const transactionRequest = core.newRouterExecuteTransactionRequest({
        chainId,
        routerLogics,
        tokensReturn,
        value: funds.native?.amountWei ?? 0,
      });
      await expect(user.sendTransaction(transactionRequest)).not.to.be.reverted;
    });
  });
});

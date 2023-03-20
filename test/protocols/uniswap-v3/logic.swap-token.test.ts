import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, mainnetTokens } from '@composable-router/test-helpers';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as protocols from 'src/protocols';
import * as utils from 'test/utils';

describe('Test UniswapV3 SwapToken Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    await claimToken(chainId, user.address, mainnetTokens.USDC, '5000');
  });

  const testCases = [
    {
      params: { input: new common.TokenAmount(mainnetTokens.ETH, '1'), tokenOut: mainnetTokens.USDC },
      slippage: 100,
    },
    {
      params: { input: new common.TokenAmount(mainnetTokens.USDC, '1000'), tokenOut: mainnetTokens.ETH },
      slippage: 100,
    },
    {
      params: { input: new common.TokenAmount(mainnetTokens.USDC, '1000'), tokenOut: mainnetTokens.DAI },
      slippage: 100,
    },
    { params: { tokenIn: mainnetTokens.ETH, output: new common.TokenAmount(mainnetTokens.USDC, '1000') } },
    { params: { tokenIn: mainnetTokens.USDC, output: new common.TokenAmount(mainnetTokens.ETH, '1') } },
    { params: { tokenIn: mainnetTokens.USDC, output: new common.TokenAmount(mainnetTokens.DAI, '1000') } },
  ];

  testCases.forEach(({ params, slippage }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. get input or output
      const uniswapV3SwapToken = new protocols.uniswapv3.SwapTokenLogic(chainId);
      const quotation = await uniswapV3SwapToken.quote(params);
      const { tradeType, input, output } = quotation;

      // 2. build funds, tokensReturn
      const funds = new common.TokenAmounts(input);
      const tokensReturn = [output.token.elasticAddress];

      // 3. build router logics
      const erc20Funds = funds.erc20;
      const routerLogics = await utils.getPermitAndPullTokenRouterLogics(chainId, user, erc20Funds);
      routerLogics.push(await uniswapV3SwapToken.getLogic(quotation, { account: user.address, slippage }));

      // 4. send router tx
      const transactionRequest = core.newRouterExecuteTransactionRequest({
        chainId,
        routerLogics,
        tokensReturn,
        value: funds.native?.amountWei ?? 0,
      });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
      if (tradeType === core.TradeType.exactIn) {
        await expect(user.address).to.changeBalance(input.token, -input.amount);
        await expect(user.address).to.changeBalance(output.token, output.amount, 100);
      } else {
        await expect(user.address).to.changeBalance(input.token, -input.amount, 100);
        await expect(user.address).to.changeBalance(output.token, output.amount);
      }
    });
  });
});

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as uniswapv3 from 'src/logics/uniswap-v3';
import * as utils from 'test/utils';

describe('mainnet-pb: Test UniswapV3 SwapToken Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    await claimToken(chainId, user.address, common.mainnetTokens.USDC, '5000');
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      params: {
        input: new common.TokenAmount(common.mainnetTokens.ETH, '1'),
        tokenOut: common.mainnetTokens.USDC,
        slippage: 5000,
      },
    },
    {
      params: {
        input: new common.TokenAmount(common.mainnetTokens.USDC, '1'),
        tokenOut: common.mainnetTokens.ETH,
        slippage: 5000,
      },
    },
    {
      params: {
        input: new common.TokenAmount(common.mainnetTokens.USDC, '1000'),
        tokenOut: common.mainnetTokens.DAI,
        slippage: 5000,
      },
    },
    {
      params: {
        input: new common.TokenAmount(common.mainnetTokens.ETH, '1'),
        tokenOut: common.mainnetTokens.USDC,
        slippage: 5000,
      },
      balanceBps: 5000,
    },
    {
      params: {
        input: new common.TokenAmount(common.mainnetTokens.USDC, '1'),
        tokenOut: common.mainnetTokens.ETH,
        slippage: 5000,
      },
      balanceBps: 5000,
    },
    {
      params: {
        input: new common.TokenAmount(common.mainnetTokens.USDC, '1000'),
        tokenOut: common.mainnetTokens.DAI,
        slippage: 5000,
      },
      balanceBps: 5000,
    },
    {
      params: {
        tokenIn: common.mainnetTokens.ETH,
        output: new common.TokenAmount(common.mainnetTokens.USDC, '1000'),
        slippage: 5000,
      },
    },
    {
      params: {
        tokenIn: common.mainnetTokens.USDC,
        output: new common.TokenAmount(common.mainnetTokens.ETH, '0.001'),
        slippage: 5000,
      },
    },
    {
      params: {
        tokenIn: common.mainnetTokens.USDC,
        output: new common.TokenAmount(common.mainnetTokens.DAI, '1000'),
        slippage: 5000,
      },
    },
  ];

  testCases.forEach(({ params, balanceBps }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. get input or output
      const uniswapV3SwapTokenLogic = new uniswapv3.SwapTokenLogic(chainId);
      const quotation = await uniswapV3SwapTokenLogic.quote(params);
      const { tradeType, input, output } = quotation;

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
      const routerLogics: core.DataType.LogicStruct[] = [];
      routerLogics.push(await uniswapV3SwapTokenLogic.build(quotation, { account: user.address }));

      // 4. get router permit2 datas
      const permit2Datas = await utils.getRouterPermit2Datas(chainId, user, funds.erc20);

      // 5. send router tx
      const routerKit = new core.RouterKit(chainId);
      const transactionRequest = routerKit.buildExecuteTransactionRequest({
        permit2Datas,
        routerLogics,
        tokensReturn,
        value: funds.native?.amountWei ?? 0,
      });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
      if (tradeType === core.TradeType.exactIn) {
        await expect(user.address).to.changeBalance(input.token, -input.amount);
        await expect(user.address).to.changeBalance(output.token, output.amount, params.slippage);
      } else {
        await expect(user.address).to.changeBalance(input.token, -input.amount, params.slippage);
        await expect(user.address).to.changeBalance(output.token, output.amount);
      }
    });
  });
});

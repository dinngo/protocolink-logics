import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as paraswapv5 from 'src/logics/paraswap-v5';
import * as utils from 'test/utils';

describe('mainnet: Test ParaswapV5 SwapToken Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    await claimToken(chainId, user.address, mainnetTokens.ETH, '100');
    await claimToken(chainId, user.address, mainnetTokens.USDC, '3000');
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      params: {
        input: new common.TokenAmount(mainnetTokens.ETH, '1'),
        tokenOut: mainnetTokens.USDC,
        slippage: 500,
      },
    },
    {
      params: {
        input: new common.TokenAmount(mainnetTokens.USDC, '1'),
        tokenOut: mainnetTokens.ETH,
        slippage: 500,
      },
    },
    {
      params: {
        input: new common.TokenAmount(mainnetTokens.USDC, '1'),
        tokenOut: mainnetTokens.DAI,
        slippage: 500,
      },
    },
    {
      params: {
        tokenIn: mainnetTokens.ETH,
        output: new common.TokenAmount(mainnetTokens.USDC, '1'),
        slippage: 500,
      },
    },
    {
      params: {
        tokenIn: mainnetTokens.USDC,
        output: new common.TokenAmount(mainnetTokens.ETH, '1'),
        slippage: 500,
      },
    },
    {
      params: {
        tokenIn: mainnetTokens.USDC,
        output: new common.TokenAmount(mainnetTokens.DAI, '1'),
        slippage: 500,
      },
    },
  ];

  testCases.forEach(({ params }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. get output
      const paraswapV5SwapTokenLogic = new paraswapv5.SwapTokenLogic(chainId);
      const quotation = await paraswapV5SwapTokenLogic.quote(params);
      const { input, output } = quotation;

      // 2. build funds, tokensReturn
      const funds = new common.TokenAmounts(input);
      const tokensReturn = [output.token.elasticAddress];

      // 3. build router logics
      const routerLogics: core.IParam.LogicStruct[] = [];
      routerLogics.push(await paraswapV5SwapTokenLogic.build(quotation, { account: user.address }));

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
      await expect(user.address).to.changeBalance(input.token, -input.amount);
      await expect(user.address).to.changeBalance(output.token, output.amount, quotation.slippage);
    });
  });
});

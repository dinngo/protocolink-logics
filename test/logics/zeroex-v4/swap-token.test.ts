import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import hre from 'hardhat';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import * as utils from 'test/utils';
import { expect } from 'chai';
import * as zeroexv4 from 'src/logics/zeroex-v4';

const apiKey = process.env.ZEROEX_API_KEY as string;

describe('mainnet: Test ZeroExV4 SwapToken Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    await claimToken(chainId, user.address, mainnetTokens.ETH, '100');
    await claimToken(chainId, user.address, mainnetTokens.USDC, '3000');
    await claimToken(chainId, user.address, mainnetTokens.WETH, '100');
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      params: {
        input: new common.TokenAmount(mainnetTokens.ETH, '1'),
        tokenOut: mainnetTokens.USDC,
        slippage: 100,
        apiKey,
      },
    },
    {
      params: {
        input: new common.TokenAmount(mainnetTokens.USDC, '1'),
        tokenOut: mainnetTokens.ETH,
        slippage: 500,
        apiKey,
      },
    },
    {
      params: {
        input: new common.TokenAmount(mainnetTokens.USDC, '1'),
        tokenOut: mainnetTokens.DAI,
        slippage: 500,
        apiKey,
      },
    },
    {
      params: {
        input: new common.TokenAmount(mainnetTokens.WETH, '1'),
        tokenOut: mainnetTokens.ETH,
        slippage: 0,
        apiKey,
      },
    },
    {
      params: {
        input: new common.TokenAmount(mainnetTokens.ETH, '1'),
        tokenOut: mainnetTokens.WETH,
        slippage: 0,
        apiKey,
      },
    },
  ];

  testCases.forEach(({ params }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. get output
      const zeroexV4SwapTokenLogic = new zeroexv4.SwapTokenLogic(chainId);
      const quotation = await zeroexV4SwapTokenLogic.quote(params);
      const { input, output } = quotation;

      // 2. build funds, tokensReturn
      const funds = new common.TokenAmounts(input);
      const tokensReturn = [output.token.elasticAddress];

      // 3. build router logics
      const routerLogics: core.DataType.LogicStruct[] = [];
      routerLogics.push(await zeroexV4SwapTokenLogic.build(quotation, { account: user.address }));

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

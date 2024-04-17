import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import { getNativeToken } from '@protocolink/common';
import hre from 'hardhat';
import { mainnetTokens, optimismTokens } from 'src/logics/stargate';
import * as stargate from 'src/logics/stargate';
import * as utils from 'test/utils';

describe('mainnet: Test Stargate SwapToken Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    await claimToken(chainId, user.address, mainnetTokens.USDC, '5000');
    await claimToken(chainId, user.address, mainnetTokens.STG, '10', '0x65bb797c2B9830d891D87288F029ed8dACc19705');
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      params: {
        input: new common.TokenAmount(mainnetTokens.ETH, '1'),
        tokenOut: optimismTokens.ETH,
        dstChainId: common.ChainId.optimism,
        slippage: 500,
      },
    },
    {
      params: {
        input: new common.TokenAmount(mainnetTokens.USDC, '100'),
        tokenOut: optimismTokens['USDC.e'],
        dstChainId: common.ChainId.optimism,
        slippage: 500,
      },
    },
    {
      params: {
        input: new common.TokenAmount(mainnetTokens.STG, '1'),
        tokenOut: optimismTokens.STG,
        dstChainId: common.ChainId.optimism,
        slippage: 500,
      },
    },
    {
      params: {
        input: new common.TokenAmount(mainnetTokens.STG, '1'),
        tokenOut: optimismTokens.STG,
        dstChainId: common.ChainId.optimism,
        slippage: 500,
      },
      balanceBps: 5000,
    },
  ];

  testCases.forEach(({ params, balanceBps }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. get input or output
      const stargateSwapTokenLogic = new stargate.SwapTokenLogic(chainId);
      const quotation = await stargateSwapTokenLogic.quote({ receiver: user.address, ...params });
      const { input, fee } = quotation;

      // 2. build funds, tokensReturn
      const feeTokenAmount = new common.TokenAmount(getNativeToken(chainId)).setWei(fee);
      const funds = new common.TokenAmounts([feeTokenAmount]);
      const tokensReturn = [input.token.elasticAddress];
      if (balanceBps) {
        funds.add(utils.calcRequiredAmountByBalanceBps(input, balanceBps));
        tokensReturn.push(input.token.elasticAddress);
      } else {
        funds.add(input);
      }

      // 3. build router logics
      const routerLogics: core.DataType.LogicStruct[] = [];
      routerLogics.push(await stargateSwapTokenLogic.build(quotation, { account: user.address }));

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
    });
  });
});

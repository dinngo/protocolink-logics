import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as utils from 'test/utils';
import * as wagmi from 'src/logics/wagmi';

describe('iota-pb: Test Wagmi SwapToken Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    await claimToken(
      chainId,
      user.address,
      common.iotaTokens.USDT,
      '5000',
      '0x7fA6e7C26Fac91541306B0240f930599F6e1D041'
    );
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      params: {
        input: new common.TokenAmount(common.iotaTokens.IOTA, '100'),
        tokenOut: common.iotaTokens.USDT,
        slippage: 5000,
      },
    },
    {
      params: {
        input: new common.TokenAmount(common.iotaTokens.USDT, '100'),
        tokenOut: common.iotaTokens.IOTA,
        slippage: 5000,
      },
    },
    {
      params: {
        input: new common.TokenAmount(common.iotaTokens.USDT, '100'),
        tokenOut: common.iotaTokens.WETH,
        slippage: 5000,
      },
    },
    {
      params: {
        input: new common.TokenAmount(common.iotaTokens.IOTA, '100'),
        tokenOut: common.iotaTokens.USDT,
        slippage: 5000,
      },
      balanceBps: 5000,
    },
    {
      params: {
        input: new common.TokenAmount(common.iotaTokens.USDT, '100'),
        tokenOut: common.iotaTokens.IOTA,
        slippage: 5000,
      },
      balanceBps: 5000,
    },
    {
      params: {
        input: new common.TokenAmount(common.iotaTokens.USDT, '100'),
        tokenOut: common.iotaTokens.WETH,
        slippage: 5000,
      },
      balanceBps: 5000,
    },
  ];

  testCases.forEach(({ params, balanceBps }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. get input or output
      const wagmiSwapTokenLogic = new wagmi.SwapTokenLogic(chainId);
      const quotation = await wagmiSwapTokenLogic.quote(params);
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
      routerLogics.push(await wagmiSwapTokenLogic.build(quotation, { account: user.address }));

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

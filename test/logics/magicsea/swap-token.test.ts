import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import hre from 'hardhat';
import { iotaTokens } from 'src/logics/magicsea/tokens';
import * as magicsea from 'src/logics/magicsea';
import * as utils from 'test/utils';

describe('iota-pb: Test MagicSea SwapToken Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();

    await claimToken(chainId, user.address, iotaTokens.GIGA, '5000000', '0x67eFFE3187C54C23dBC82728677DD522EA813928');
    await claimToken(chainId, user.address, iotaTokens.USDT, '5000', '0xEbFC9b9665044A1C5D6F0f5738f98dd30ed8D278');
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      params: {
        input: new common.TokenAmount(iotaTokens.IOTA, '100'),
        tokenOut: iotaTokens.GIGA,
        slippage: 5000,
      },
    },
    {
      params: {
        input: new common.TokenAmount(iotaTokens.GIGA, '30000'),
        tokenOut: iotaTokens.IOTA,
        slippage: 5000,
      },
    },
    {
      params: {
        input: new common.TokenAmount(iotaTokens.GIGA, '30000'),
        tokenOut: iotaTokens.USDT,
        slippage: 5000,
      },
    },
    {
      params: {
        tokenIn: iotaTokens.IOTA,
        output: new common.TokenAmount(iotaTokens.GIGA, '30000'),
        slippage: 5000,
      },
    },
    {
      params: {
        tokenIn: iotaTokens.GIGA,
        output: new common.TokenAmount(iotaTokens.IOTA, '1'),
        slippage: 5000,
      },
    },
    {
      params: {
        tokenIn: iotaTokens.USDT,
        output: new common.TokenAmount(iotaTokens.GIGA, '30000'),
        slippage: 5000,
      },
    },
  ];

  testCases.forEach(({ params, balanceBps }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. get input or output
      const magicseaSwapTokenLogic = new magicsea.SwapTokenLogic(chainId);
      const quotation = await magicseaSwapTokenLogic.quote(params);
      const { tradeType, input, output } = quotation;

      const tokenIn = tradeType === core.TradeType.exactIn ? params.input.token : params.tokenIn;
      const tokenOut = tradeType === core.TradeType.exactIn ? params.tokenOut : params.output.token;

      expect(quotation.input.token.is(tokenIn)).to.be.true;
      expect(quotation.output.token.is(tokenOut)).to.be.true;

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
      routerLogics.push(await magicseaSwapTokenLogic.build(quotation, { account: user.address }));

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

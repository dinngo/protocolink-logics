import { LogicTestCase } from 'test/types';
import { SwapTokenLogic, SwapTokenLogicFields, SwapTokenLogicOptions } from './logic.swap-token';
import * as common from '@furucombo/composable-router-common';
import { constants, utils } from 'ethers';
import * as core from '@furucombo/composable-router-core';
import { expect } from 'chai';
import { getConfig } from './configs';
import { mainnetTokens } from '@furucombo/composable-router-test-helpers';
import * as univ3 from 'src/modules/univ3';

describe('UniswapV3 SwapTokenLogic', function () {
  context('Test getTokenList', async function () {
    SwapTokenLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.getNetworkId(chainId)}`, async function () {
        const logic = new SwapTokenLogic(chainId);
        const tokenList = await logic.getTokenList();
        expect(tokenList).to.have.lengthOf.above(0);
      });
    });
  });

  context('Test build', function () {
    const chainId = common.ChainId.mainnet;
    const config = getConfig(chainId);
    const logic = new SwapTokenLogic(chainId);
    const iface = univ3.SwapRouter__factory.createInterface();

    const testCases: LogicTestCase<SwapTokenLogicFields, SwapTokenLogicOptions>[] = [
      {
        fields: {
          tradeType: core.TradeType.exactIn,
          input: new common.TokenAmount(mainnetTokens.ETH, '1'),
          output: new common.TokenAmount(mainnetTokens.USDC, '1661.098116'),
          fee: 500,
          slippage: 100,
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      },
      {
        fields: {
          tradeType: core.TradeType.exactIn,
          input: new common.TokenAmount(mainnetTokens.ETH, '1'),
          output: new common.TokenAmount(mainnetTokens.USDC, '1661.098116'),
          path: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc20001f42260fac5e5542a773aa44fbcfedf7c193bc2c5990001f4a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          slippage: 100,
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      },
      {
        fields: {
          tradeType: core.TradeType.exactIn,
          input: new common.TokenAmount(mainnetTokens.USDC, '1000'),
          output: new common.TokenAmount(mainnetTokens.ETH, '0.608027615305460657'),
          fee: 500,
          slippage: 100,
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      },
      {
        fields: {
          tradeType: core.TradeType.exactIn,
          input: new common.TokenAmount(mainnetTokens.USDC, '1000'),
          output: new common.TokenAmount(mainnetTokens.ETH, '0.608027615305460657'),
          path: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb480001f42260fac5e5542a773aa44fbcfedf7c193bc2c5990001f4c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
          slippage: 100,
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      },
      {
        fields: {
          tradeType: core.TradeType.exactIn,
          input: new common.TokenAmount(mainnetTokens.USDC, '1000'),
          output: new common.TokenAmount(mainnetTokens.DAI, '1000'),
          fee: 500,
          slippage: 100,
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      },
      {
        fields: {
          tradeType: core.TradeType.exactIn,
          input: new common.TokenAmount(mainnetTokens.USDC, '1000'),
          output: new common.TokenAmount(mainnetTokens.DAI, '1000'),
          path: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb480001f42260fac5e5542a773aa44fbcfedf7c193bc2c5990001f46b175474e89094c44da98b954eedeac495271d0f',
          slippage: 100,
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      },
      {
        fields: {
          tradeType: core.TradeType.exactOut,
          input: new common.TokenAmount(mainnetTokens.ETH, '0.608027615305460657'),
          output: new common.TokenAmount(mainnetTokens.USDC, '1000'),
          fee: 500,
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      },
      {
        fields: {
          tradeType: core.TradeType.exactOut,
          input: new common.TokenAmount(mainnetTokens.ETH, '0.608027615305460657'),
          output: new common.TokenAmount(mainnetTokens.USDC, '1000'),
          path: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc20001f42260fac5e5542a773aa44fbcfedf7c193bc2c5990001f4a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      },
      {
        fields: {
          tradeType: core.TradeType.exactOut,
          input: new common.TokenAmount(mainnetTokens.USDC, '1000'),
          output: new common.TokenAmount(mainnetTokens.ETH, '0.608027615305460657'),
          fee: 500,
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      },
      {
        fields: {
          tradeType: core.TradeType.exactOut,
          input: new common.TokenAmount(mainnetTokens.USDC, '1000'),
          output: new common.TokenAmount(mainnetTokens.ETH, '0.608027615305460657'),
          path: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb480001f42260fac5e5542a773aa44fbcfedf7c193bc2c5990001f4c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      },
      {
        fields: {
          tradeType: core.TradeType.exactOut,
          input: new common.TokenAmount(mainnetTokens.USDC, '1000'),
          output: new common.TokenAmount(mainnetTokens.DAI, '1000'),
          fee: 500,
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      },
      {
        fields: {
          tradeType: core.TradeType.exactOut,
          input: new common.TokenAmount(mainnetTokens.USDC, '1000'),
          output: new common.TokenAmount(mainnetTokens.DAI, '1000'),
          path: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb480001f42260fac5e5542a773aa44fbcfedf7c193bc2c5990001f4c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      },
    ];

    testCases.forEach(({ fields, options }) => {
      it(`${fields.input.token.symbol} to ${fields.output.token.symbol} ${fields.tradeType} ${
        univ3.isSwapTokenLogicSingleHopFields(fields) ? 'Single' : ''
      }`, async function () {
        const routerLogic = await logic.build(fields, options);
        const sig = routerLogic.data.substring(0, 10);
        const { tradeType, input, output, balanceBps } = fields;

        expect(routerLogic.to).to.eq(config.swapRouterAddress);
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        expect(sig).to.eq(
          iface.getSighash(
            `exact${tradeType === core.TradeType.exactIn ? 'Input' : 'Output'}${
              univ3.isSwapTokenLogicSingleHopFields(fields) ? 'Single' : ''
            }`
          )
        );
        expect(routerLogic.inputs[0].token).to.eq(input.token.wrapped.address);
        if (balanceBps) {
          expect(routerLogic.inputs[0].balanceBps).to.eq(balanceBps);
          expect(routerLogic.inputs[0].amountOrOffset).to.eq(common.getParamOffset(1));
        } else {
          expect(routerLogic.inputs[0].balanceBps).to.eq(core.BPS_NOT_USED);
          expect(routerLogic.inputs[0].amountOrOffset).eq(input.amountWei);
        }
        expect(routerLogic.wrapMode).to.eq(
          input.token.isNative
            ? core.WrapMode.wrapBefore
            : output.token.isNative
            ? core.WrapMode.unwrapAfter
            : core.WrapMode.none
        );
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

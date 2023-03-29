import { LogicTestCase } from 'test/types';
import { SWAP_ROUTER_ADDRESS } from './constants';
import { SwapRouter__factory } from './contracts';
import {
  SwapTokenLogic,
  SwapTokenLogicFields,
  SwapTokenLogicOptions,
  isSwapTokenLogicSingleHopFields,
} from './logic.swap-token';
import * as common from '@composable-router/common';
import { constants, utils } from 'ethers';
import * as core from '@composable-router/core';
import { expect } from 'chai';
import { mainnetTokens } from '@composable-router/test-helpers';

describe('UniswapV3 SwapTokenLogic', function () {
  context('Test getTokenList', async function () {
    SwapTokenLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.getNetworkId(chainId)}`, async function () {
        const swapTokenLogic = new SwapTokenLogic(chainId);
        const tokens = await swapTokenLogic.getTokenList();
        expect(tokens.length).to.be.gt(0);
      });
    });
  });

  context('Test getLogic', function () {
    const chainId = common.ChainId.mainnet;
    const uniswapV3SwapTokenLogic = new SwapTokenLogic(chainId);
    const ifaceSwapRouter = SwapRouter__factory.createInterface();

    const testCases: LogicTestCase<SwapTokenLogicFields, SwapTokenLogicOptions>[] = [
      {
        fields: {
          tradeType: core.TradeType.exactIn,
          input: new common.TokenAmount(mainnetTokens.ETH, '1'),
          output: new common.TokenAmount(mainnetTokens.USDC, '1661.098116'),
          fee: 500,
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa', slippage: 100 },
      },
      {
        fields: {
          tradeType: core.TradeType.exactIn,
          input: new common.TokenAmount(mainnetTokens.ETH, '1'),
          output: new common.TokenAmount(mainnetTokens.USDC, '1661.098116'),
          path: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc20001f42260fac5e5542a773aa44fbcfedf7c193bc2c5990001f4a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa', slippage: 100 },
      },
      {
        fields: {
          tradeType: core.TradeType.exactIn,
          input: new common.TokenAmount(mainnetTokens.USDC, '1000'),
          output: new common.TokenAmount(mainnetTokens.ETH, '0.608027615305460657'),
          fee: 500,
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa', slippage: 100 },
      },
      {
        fields: {
          tradeType: core.TradeType.exactIn,
          input: new common.TokenAmount(mainnetTokens.USDC, '1000'),
          output: new common.TokenAmount(mainnetTokens.ETH, '0.608027615305460657'),
          path: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb480001f42260fac5e5542a773aa44fbcfedf7c193bc2c5990001f4c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa', slippage: 100 },
      },
      {
        fields: {
          tradeType: core.TradeType.exactIn,
          input: new common.TokenAmount(mainnetTokens.USDC, '1000'),
          output: new common.TokenAmount(mainnetTokens.DAI, '1000'),
          fee: 500,
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa', slippage: 100 },
      },
      {
        fields: {
          tradeType: core.TradeType.exactIn,
          input: new common.TokenAmount(mainnetTokens.USDC, '1000'),
          output: new common.TokenAmount(mainnetTokens.DAI, '1000'),
          path: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb480001f42260fac5e5542a773aa44fbcfedf7c193bc2c5990001f46b175474e89094c44da98b954eedeac495271d0f',
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa', slippage: 100 },
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
        isSwapTokenLogicSingleHopFields(fields) ? 'Single' : ''
      }`, async function () {
        const routerLogic = await uniswapV3SwapTokenLogic.getLogic(fields, options);
        const sig = routerLogic.data.substring(0, 10);
        const { tradeType, input, output, amountBps } = fields;

        expect(routerLogic.to).to.eq(SWAP_ROUTER_ADDRESS);
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        expect(sig).to.eq(
          ifaceSwapRouter.getSighash(
            `exact${tradeType === core.TradeType.exactIn ? 'Input' : 'Output'}${
              isSwapTokenLogicSingleHopFields(fields) ? 'Single' : ''
            }`
          )
        );
        expect(routerLogic.inputs[0].token).to.eq(input.token.wrapped.address);
        if (amountBps) {
          expect(routerLogic.inputs[0].amountBps).to.eq(amountBps);
          expect(routerLogic.inputs[0].amountOrOffset).to.eq(common.getParamOffset(1));
        } else {
          expect(routerLogic.inputs[0].amountBps).to.eq(constants.MaxUint256);
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

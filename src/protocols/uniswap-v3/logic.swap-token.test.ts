import { LogicTestCase } from 'test/types';
import { SWAP_ROUTER_ADDRESS } from './constants';
import { SwapRouter__factory } from './contracts';
import { SwapTokenLogic, SwapTokenLogicFields, SwapTokenLogicOptions } from './logic.swap-token';
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
    const swapRouter = SwapRouter__factory.createInterface();

    const testCases: LogicTestCase<SwapTokenLogicFields, SwapTokenLogicOptions>[] = [
      {
        fields: {
          tradeType: core.TradeType.exactIn,
          input: new common.TokenAmount(mainnetTokens.ETH, '1'),
          output: new common.TokenAmount(mainnetTokens.USDC, '1661.098116'),
          path: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb480001f42260fac5e5542a773aa44fbcfedf7c193bc2c5990001f4c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
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
          tradeType: core.TradeType.exactOut,
          input: new common.TokenAmount(mainnetTokens.ETH, '0.608027615305460657'),
          output: new common.TokenAmount(mainnetTokens.USDC, '1000'),
          fee: 500,
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa', slippage: 100 },
      },
    ];

    testCases.forEach(({ fields, options }) => {
      it(`${fields.input.token.symbol} to ${fields.output.token.symbol} ${fields.tradeType}`, async function () {
        const routerLogic = await uniswapV3SwapTokenLogic.getLogic(fields, options);
        const sig = routerLogic.data.substring(0, 10);
        const { tradeType, input, output } = fields;

        expect(routerLogic.to).to.eq(SWAP_ROUTER_ADDRESS);
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        if ((input.token.isNative && tradeType === core.TradeType.exactOut) || output.token.isNative) {
          expect(sig).to.eq(swapRouter.getSighash('multicall'));
        }
        if (input.token.isNative) {
          expect(routerLogic.inputs[0].token).to.eq(common.ELASTIC_ADDRESS);
        }
        expect(routerLogic.inputs[0].amountBps).to.eq(constants.MaxUint256);
        expect(routerLogic.inputs[0].amountOrOffset).to.eq(input.amountWei);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

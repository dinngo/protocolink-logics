import { Currency, CurrencyAmount, TradeType } from '@uniswap/sdk-core';
import JSBI from 'jsbi';
import { Service } from './service';
import { WRAPPED_NATIVE_CURRENCY, mainnetTokens } from './constants';
import * as common from '@composable-router/common';
import { expect } from 'chai';

function newTestCaseTitle(
  chainId: number,
  tradeType: TradeType,
  amountSpecified: CurrencyAmount<Currency>,
  otherCurrency: Currency
) {
  let input: string;
  let output: string;
  if (tradeType === TradeType.EXACT_INPUT) {
    input = `${amountSpecified.toExact()} ${amountSpecified.currency.symbol}`;
    output = otherCurrency.symbol!;
  } else {
    input = otherCurrency.symbol!;
    output = `${amountSpecified.toExact()} ${amountSpecified.currency.symbol}`;
  }

  return `${common.getNetworkId(chainId)}: swap ${input} to ${output}`;
}

describe('UniswapV3 Service', function () {
  context('Test getBestTrade', function () {
    const testCases = [
      {
        chainId: common.ChainId.mainnet,
        tradeType: TradeType.EXACT_INPUT,
        amountSpecified: CurrencyAmount.fromRawAmount(
          WRAPPED_NATIVE_CURRENCY[common.ChainId.mainnet],
          common.toSmallUnit('1', WRAPPED_NATIVE_CURRENCY[common.ChainId.mainnet].decimals).toString()
        ),
        otherCurrency: mainnetTokens.USDC,
      },
      {
        chainId: common.ChainId.mainnet,
        tradeType: TradeType.EXACT_OUTPUT,
        amountSpecified: CurrencyAmount.fromRawAmount(
          mainnetTokens.USDC,
          common.toSmallUnit('1000', mainnetTokens.USDC.decimals).toString()
        ),
        otherCurrency: WRAPPED_NATIVE_CURRENCY[common.ChainId.mainnet],
      },
      {
        chainId: common.ChainId.mainnet,
        tradeType: TradeType.EXACT_INPUT,
        amountSpecified: CurrencyAmount.fromRawAmount(
          mainnetTokens.USDC,
          common.toSmallUnit('1000', mainnetTokens.USDC.decimals).toString()
        ),
        otherCurrency: WRAPPED_NATIVE_CURRENCY[common.ChainId.mainnet],
      },
      {
        chainId: common.ChainId.mainnet,
        tradeType: TradeType.EXACT_OUTPUT,
        amountSpecified: CurrencyAmount.fromRawAmount(
          WRAPPED_NATIVE_CURRENCY[common.ChainId.mainnet],
          common.toSmallUnit('1', WRAPPED_NATIVE_CURRENCY[common.ChainId.mainnet].decimals).toString()
        ),
        otherCurrency: mainnetTokens.USDC,
      },
      {
        chainId: common.ChainId.mainnet,
        tradeType: TradeType.EXACT_INPUT,
        amountSpecified: CurrencyAmount.fromRawAmount(
          mainnetTokens.USDC,
          common.toSmallUnit('100', mainnetTokens.USDC.decimals).toString()
        ),
        otherCurrency: mainnetTokens.DAI,
      },
      {
        chainId: common.ChainId.mainnet,
        tradeType: TradeType.EXACT_OUTPUT,
        amountSpecified: CurrencyAmount.fromRawAmount(
          mainnetTokens.DAI,
          common.toSmallUnit('100', mainnetTokens.DAI.decimals).toString()
        ),
        otherCurrency: mainnetTokens.USDC,
      },
    ];

    testCases.forEach(({ chainId, tradeType, amountSpecified, otherCurrency }) => {
      it(newTestCaseTitle(chainId, tradeType, amountSpecified, otherCurrency), async function () {
        const service = new Service(chainId);
        const { inputAmount, outputAmount } = await service.getBestTrade(tradeType, amountSpecified, otherCurrency);
        expect(
          JSBI.GT(tradeType === TradeType.EXACT_INPUT ? outputAmount.quotient : inputAmount.quotient, 0)
        ).to.be.true;
      });
    });
  });
});

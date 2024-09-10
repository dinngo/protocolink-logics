import { LogicTestCase } from 'test/types';
import { SwapRouter02__factory } from './contracts';
import { SwapTokenLogic, SwapTokenLogicFields, SwapTokenLogicOptions } from './logic.swap-token';
import * as common from '@protocolink/common';
import { constants, utils } from 'ethers';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import { getConfig } from './configs';
import * as univ3 from 'src/modules/univ3';

describe('Wagmi SwapTokenLogic', function () {
  context('Test getTokenList', async function () {
    SwapTokenLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.toNetworkId(chainId)}`, async function () {
        const logic = new SwapTokenLogic(chainId);
        const tokenList = await logic.getTokenList();
        expect(tokenList).to.have.lengthOf.above(0);
      });
    });
  });

  context('Test build', function () {
    const chainId = common.ChainId.iota;
    const config = getConfig(chainId);
    const logic = new SwapTokenLogic(chainId);
    const iface = SwapRouter02__factory.createInterface();

    const testCases: LogicTestCase<SwapTokenLogicFields, SwapTokenLogicOptions>[] = [
      {
        fields: {
          tradeType: core.TradeType.exactIn,
          input: new common.TokenAmount(common.iotaTokens.IOTA, '100'),
          output: new common.TokenAmount(common.iotaTokens.USDT, '13.7665'),
          fee: 500,
          slippage: 100,
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      },
      {
        fields: {
          tradeType: core.TradeType.exactIn,
          input: new common.TokenAmount(common.iotaTokens.IOTA, '100'),
          output: new common.TokenAmount(common.iotaTokens.USDT, '13.7665'),
          path: '0x6e47f8d48a01b44df3fff35d258a10a3aedc114c0001f4160345fc359604fc6e70e3c5facbde5f7a9342d80001f4c1b8045a6ef2934cf0f78b0dbd489969fa9be7e4',
          slippage: 100,
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      },
      {
        fields: {
          tradeType: core.TradeType.exactIn,
          input: new common.TokenAmount(common.iotaTokens.USDT, '100'),
          output: new common.TokenAmount(common.iotaTokens.IOTA, '785.62'),
          fee: 500,
          slippage: 100,
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      },
      {
        fields: {
          tradeType: core.TradeType.exactIn,
          input: new common.TokenAmount(common.iotaTokens.USDT, '100'),
          output: new common.TokenAmount(common.iotaTokens.IOTA, '785.62'),
          path: '0xc1b8045a6ef2934cf0f78b0dbd489969fa9be7e40001f4160345fc359604fc6e70e3c5facbde5f7a9342d80001f46e47f8d48a01b44df3fff35d258a10a3aedc114c',
          slippage: 100,
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      },
      {
        fields: {
          tradeType: core.TradeType.exactOut,
          input: new common.TokenAmount(common.iotaTokens.IOTA, '100'),
          output: new common.TokenAmount(common.iotaTokens.USDT, '13.7665'),
          fee: 500,
          slippage: 100,
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      },
      {
        fields: {
          tradeType: core.TradeType.exactOut,
          input: new common.TokenAmount(common.iotaTokens.IOTA, '100'),
          output: new common.TokenAmount(common.iotaTokens.USDT, '13.7665'),
          path: '0x6e47f8d48a01b44df3fff35d258a10a3aedc114c0001f4160345fc359604fc6e70e3c5facbde5f7a9342d80001f4c1b8045a6ef2934cf0f78b0dbd489969fa9be7e4',
          slippage: 100,
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      },
      {
        fields: {
          tradeType: core.TradeType.exactOut,
          input: new common.TokenAmount(common.iotaTokens.USDT, '100'),
          output: new common.TokenAmount(common.iotaTokens.IOTA, '785.62'),
          fee: 500,
          slippage: 100,
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      },
      {
        fields: {
          tradeType: core.TradeType.exactOut,
          input: new common.TokenAmount(common.iotaTokens.USDT, '100'),
          output: new common.TokenAmount(common.iotaTokens.IOTA, '785.62'),
          path: '0xc1b8045a6ef2934cf0f78b0dbd489969fa9be7e40001f4160345fc359604fc6e70e3c5facbde5f7a9342d80001f46e47f8d48a01b44df3fff35d258a10a3aedc114c',
          slippage: 100,
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

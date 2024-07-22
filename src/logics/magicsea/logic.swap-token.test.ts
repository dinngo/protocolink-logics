import { LogicTestCaseWithChainId } from 'test/types';
import { MagicSeaRouter__factory } from './contracts';
import { SwapTokenLogic, SwapTokenLogicFields, SwapTokenLogicOptions } from './logic.swap-token';
import * as common from '@protocolink/common';
import { constants, utils } from 'ethers';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import { getContractAddress, getTokenListUrls } from './configs';
import { iotaTokens } from './tokens';

describe('MagicSea SwapTokenLogic', function () {
  context('Test getTokenListUrls', function () {
    SwapTokenLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.toNetworkId(chainId)}`, function () {
        const urls = getTokenListUrls(chainId);
        expect(urls).to.have.lengthOf.above(0);
      });
    });
  });

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
    const iface = MagicSeaRouter__factory.createInterface();

    const testCases: LogicTestCaseWithChainId<SwapTokenLogicFields, SwapTokenLogicOptions>[] = [
      {
        chainId: common.ChainId.iota,
        fields: {
          tradeType: core.TradeType.exactIn,
          input: new common.TokenAmount(iotaTokens.IOTA, '1'),
          output: new common.TokenAmount(iotaTokens['USDC.e'], '0'),
          path: [],
          slippage: 500,
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      },
      {
        chainId: common.ChainId.iota,
        fields: {
          tradeType: core.TradeType.exactIn,
          input: new common.TokenAmount(iotaTokens['USDC.e'], '1'),
          output: new common.TokenAmount(iotaTokens.IOTA, '6'),
          path: [],
          slippage: 500,
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      },
      {
        chainId: common.ChainId.iota,
        fields: {
          tradeType: core.TradeType.exactIn,
          input: new common.TokenAmount(iotaTokens['USDC.e'], '1'),
          output: new common.TokenAmount(iotaTokens.GIGA, '2115920'),
          path: [],
          slippage: 500,
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      },
      {
        chainId: common.ChainId.iota,
        fields: {
          tradeType: core.TradeType.exactIn,
          input: new common.TokenAmount(iotaTokens['USDC.e'], '1'),
          output: new common.TokenAmount(iotaTokens.IOTA, '6'),
          path: [],
          slippage: 500,
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      },
      {
        chainId: common.ChainId.iota,
        fields: {
          tradeType: core.TradeType.exactOut,
          input: new common.TokenAmount(iotaTokens.IOTA, '6'),
          output: new common.TokenAmount(iotaTokens['USDC.e'], '1'),
          path: [],
          slippage: 500,
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      },
      {
        chainId: common.ChainId.iota,
        fields: {
          tradeType: core.TradeType.exactOut,
          input: new common.TokenAmount(iotaTokens['USDC.e'], '1'),
          output: new common.TokenAmount(iotaTokens.IOTA, '6'),
          path: [],
          slippage: 500,
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      },
      {
        chainId: common.ChainId.iota,
        fields: {
          tradeType: core.TradeType.exactOut,
          input: new common.TokenAmount(iotaTokens['USDC.e'], '1'),
          output: new common.TokenAmount(iotaTokens.GIGA, '2115920'),
          path: [],
          slippage: 500,
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      },
    ];

    testCases.forEach(({ chainId, fields, options }) => {
      it(`${fields.input.token.symbol} to ${fields.output.token.symbol}`, async function () {
        const logic = new SwapTokenLogic(chainId);
        const routerLogic = await logic.build(fields, options);
        const sig = routerLogic.data.substring(0, 10);
        const { tradeType, input, output, balanceBps } = fields;
        const magicRouterAddress = getContractAddress(chainId, 'Router');

        expect(routerLogic.to).to.eq(magicRouterAddress);
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;

        if (tradeType === core.TradeType.exactIn) {
          expect(sig).to.eq(iface.getSighash('swapExactTokensForTokens'));
        } else {
          expect(sig).to.eq(iface.getSighash('swapTokensForExactTokens'));
        }

        if (input.token.isNative) {
          expect(routerLogic.inputs[0].token).to.eq(input.token.wrapped.address);
        }

        if (balanceBps) {
          expect(routerLogic.inputs[0].balanceBps).to.eq(balanceBps);
          expect(routerLogic.inputs[0].amountOrOffset).to.eq(common.getParamOffset(0));
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

import { LogicTestCase } from 'test/types';
import { Router__factory } from './contracts';
import { SwapTokenLogic, SwapTokenLogicFields, SwapTokenLogicOptions } from './logic.swap-token';
import * as common from '@protocolink/common';
import { constants, utils } from 'ethers';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import { getContractAddress } from './configs';
import { zksyncTokens } from './tokens';

describe('SyncSwap SwapTokenLogic', function () {
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
    const chainId = common.ChainId.zksync;
    const logic = new SwapTokenLogic(chainId);
    const routerAddress = getContractAddress(chainId, 'Router');
    const iface = Router__factory.createInterface();

    const testCases: LogicTestCase<SwapTokenLogicFields, SwapTokenLogicOptions>[] = [
      {
        fields: {
          input: new common.TokenAmount(zksyncTokens.ETH, '1'),
          output: new common.TokenAmount(zksyncTokens.USDC, '0'),
          paths: [
            {
              steps: [
                {
                  pool: '0x80115c708E12eDd42E504c1cD52Aea96C547c05c',
                  tokenIn: '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91',
                },
              ],
              tokenIn: '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91',
              amountIn: '1000000000000000000',
            },
          ],
          slippage: 500,
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      },
      {
        fields: {
          input: new common.TokenAmount(zksyncTokens.USDC, '1'),
          output: new common.TokenAmount(zksyncTokens.ETH, '0'),
          paths: [
            {
              steps: [
                {
                  pool: '0x80115c708E12eDd42E504c1cD52Aea96C547c05c',
                  tokenIn: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4',
                },
              ],
              tokenIn: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4',
              amountIn: '1000000',
            },
          ],
          slippage: 500,
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      },
      {
        fields: {
          input: new common.TokenAmount(zksyncTokens.USDC, '1'),
          output: new common.TokenAmount(zksyncTokens.WBTC, '0'),
          paths: [
            {
              steps: [
                {
                  pool: '0x80115c708E12eDd42E504c1cD52Aea96C547c05c',
                  tokenIn: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4',
                },
                {
                  pool: '0xb3479139e07568BA954C8a14D5a8B3466e35533d',
                  tokenIn: '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91',
                },
              ],
              tokenIn: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4',
              amountIn: '1000000',
            },
          ],
          slippage: 500,
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      },
    ];

    testCases.forEach(({ fields, options }) => {
      it(`${fields.input.token.symbol} to ${fields.output.token.symbol}`, async function () {
        const routerLogic = await logic.build(fields, options);
        const sig = routerLogic.data.substring(0, 10);
        const { input, output } = fields;

        expect(routerLogic.to).to.eq(routerAddress);
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        expect(sig).to.eq(iface.getSighash('swap'));
        expect(routerLogic.inputs[0].token).to.eq(input.token.wrapped.address);
        expect(routerLogic.inputs[0].balanceBps).to.eq(core.BPS_NOT_USED);
        expect(routerLogic.inputs[0].amountOrOffset).to.eq(input.amountWei);
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

import { LogicTestCase } from 'test/types';
import { SwapTokenLogic, SwapTokenLogicFields, SwapTokenLogicOptions } from './logic.swap-token';
import * as common from '@protocolink/common';
import { constants, utils } from 'ethers';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import { mainnetTokens } from '@protocolink/test-helpers';
import { tokenTransferProxyAddress } from './configs';

describe('ParaswapV5 SwapTokenLogic', function () {
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
    const chainId = common.ChainId.mainnet;
    const logic = new SwapTokenLogic(chainId);

    const testCases: LogicTestCase<SwapTokenLogicFields, SwapTokenLogicOptions>[] = [
      {
        fields: {
          input: new common.TokenAmount(mainnetTokens.ETH, '1'),
          output: new common.TokenAmount(mainnetTokens.USDC, '0'),
          slippage: 500,
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      },
      {
        fields: {
          input: new common.TokenAmount(mainnetTokens.USDC, '1'),
          output: new common.TokenAmount(mainnetTokens.ETH, '0'),
          slippage: 500,
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      },
      {
        fields: {
          input: new common.TokenAmount(mainnetTokens.USDC, '1'),
          output: new common.TokenAmount(mainnetTokens.DAI, '0'),
          slippage: 500,
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      },
    ];

    testCases.forEach(({ fields, options }) => {
      it(`${fields.input.token.symbol} to ${fields.output.token.symbol}`, async function () {
        const routerLogic = await logic.build(fields, options);
        const { input } = fields;

        expect(routerLogic.to).to.eq('0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57');
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        if (input.token.isNative) {
          expect(routerLogic.inputs[0].token).to.eq(common.ELASTIC_ADDRESS);
        }
        expect(routerLogic.inputs[0].balanceBps).to.eq(core.BPS_NOT_USED);
        expect(routerLogic.inputs[0].amountOrOffset).to.eq(input.amountWei);
        expect(routerLogic.approveTo).to.eq(tokenTransferProxyAddress);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

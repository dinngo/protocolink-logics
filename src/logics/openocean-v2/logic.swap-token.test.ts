import { LogicTestCaseWithChainId } from 'test/types';
import { SwapTokenLogic, SwapTokenLogicFields, SwapTokenLogicOptions } from './logic.swap-token';
import * as common from '@protocolink/common';
import { constants, utils } from 'ethers';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import { getExchangeAddress } from './configs';
import { metisTokens } from 'src/logics/openocean-v2/tokens';

describe('OpenOceanV2 SwapTokenLogic', function () {
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
    const testCases: LogicTestCaseWithChainId<SwapTokenLogicFields, SwapTokenLogicOptions>[] = [
      {
        chainId: common.ChainId.metis,
        fields: {
          input: new common.TokenAmount(metisTokens.WETH, '1'),
          output: new common.TokenAmount(metisTokens.USDC, '0'),
          slippage: 100,
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      },
      {
        chainId: common.ChainId.metis,
        fields: {
          input: new common.TokenAmount(metisTokens.METIS, '1'),
          output: new common.TokenAmount(metisTokens.USDC, '0'),
          slippage: 100,
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      },
      {
        chainId: common.ChainId.metis,
        fields: {
          input: new common.TokenAmount(metisTokens.USDC, '1'),
          output: new common.TokenAmount(metisTokens.METIS, '0'),
          slippage: 100,
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      },
    ];

    testCases.forEach(({ chainId, fields, options }) => {
      it(`${fields.input.token.symbol} to ${fields.output.token.symbol}`, async function () {
        const logic = new SwapTokenLogic(chainId);
        const routerLogic = await logic.build(fields, options);
        const { input } = fields;

        expect(routerLogic.to).to.eq(getExchangeAddress(chainId));
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        expect(routerLogic.inputs[0].balanceBps).to.eq(core.BPS_NOT_USED);
        expect(routerLogic.inputs[0].amountOrOffset).to.eq(input.amountWei);
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

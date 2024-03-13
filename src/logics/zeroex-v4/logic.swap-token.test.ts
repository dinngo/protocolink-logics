import * as common from '@protocolink/common';
import { expect } from 'chai';
import { SwapTokenLogic, SwapTokenLogicFields, SwapTokenLogicOptions } from './logic.swap-token';
import { LogicTestCaseWithChainId } from 'test/types';
import { mainnetTokens } from '@protocolink/test-helpers';
import { constants, utils } from 'ethers';
import * as core from '@protocolink/core';
import { getExchangeProxyAddress } from './configs';

const apiKey = process.env.ZEROEX_API_KEY as string;

describe('0x SwapTokenLogic', () => {
  context('Test getTokenList', async () => {
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
        chainId: common.ChainId.mainnet,
        fields: {
          input: new common.TokenAmount(mainnetTokens.ETH, '1'),
          output: new common.TokenAmount(mainnetTokens.USDC, '0'),
          slippage: 500,
          apiKey,
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      },
      {
        chainId: common.ChainId.mainnet,
        fields: {
          input: new common.TokenAmount(mainnetTokens.USDC, '1'),
          output: new common.TokenAmount(mainnetTokens.ETH, '0'),
          slippage: 500,
          apiKey,
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      },
      {
        chainId: common.ChainId.mainnet,
        fields: {
          input: new common.TokenAmount(mainnetTokens.USDC, '1'),
          output: new common.TokenAmount(mainnetTokens.DAI, '0'),
          slippage: 500,
          apiKey,
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      },
      {
        chainId: common.ChainId.arbitrum,
        fields: {
          input: new common.TokenAmount(
            {
              chainId: 42161,
              address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
              decimals: 6,
              symbol: 'USDC',
              name: 'USD Coin (Arb1)',
            },
            '49.576374'
          ),
          output: new common.TokenAmount(
            {
              chainId: 42161,
              address: '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a',
              decimals: 18,
              symbol: 'GMX',
              name: 'GMX',
            },
            '1'
          ),
          slippage: 100,
          apiKey,
        },
        options: { account: '0x4F5ef03E870332A1B42453bBf57B8A041E89eFe8' },
      },
    ];

    testCases.forEach(({ chainId, fields, options }) => {
      it(`${fields.input.token.symbol} to ${fields.output.token.symbol}`, async function () {
        const logic = new SwapTokenLogic(chainId);
        const routerLogic = await logic.build(fields, options);
        const { input } = fields;

        expect(routerLogic.to).to.eq(getExchangeProxyAddress(chainId));
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        if (input.token.isNative) {
          expect(routerLogic.inputs[0].token).to.eq(common.ELASTIC_ADDRESS);
        }
        expect(routerLogic.inputs[0].balanceBps).to.eq(core.BPS_NOT_USED);
        expect(routerLogic.inputs[0].amountOrOffset).to.eq(input.amountWei);
        expect(routerLogic.approveTo).to.eq(getExchangeProxyAddress(chainId));
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

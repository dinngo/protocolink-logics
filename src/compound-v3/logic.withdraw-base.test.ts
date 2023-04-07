import { Comet__factory } from './contracts';
import { LogicTestCase } from 'test/types';
import { MarketId, getMarket } from './config';
import { WithdrawBaseLogic, WithdrawBaseLogicFields } from './logic.withdraw-base';
import * as common from '@furucombo/composable-router-common';
import { constants, utils } from 'ethers';
import * as core from '@furucombo/composable-router-core';
import { expect } from 'chai';
import { mainnetTokens } from './tokens';

describe('CompoundV3 WithdrawBaseLogic', function () {
  context('Test getTokenList', async function () {
    WithdrawBaseLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.getNetworkId(chainId)}`, async function () {
        const logic = new WithdrawBaseLogic(chainId);
        const tokenList = await logic.getTokenList();
        expect(Object.keys(tokenList)).to.have.lengthOf.above(0);
        for (const marketId of Object.keys(tokenList)) {
          expect(tokenList[marketId]).to.have.lengthOf.above(0);
          for (const tokenPair of tokenList[marketId]) {
            expect(tokenPair).to.have.lengthOf(2);
          }
        }
      });
    });
  });

  context('Test build', function () {
    const chainId = common.ChainId.mainnet;
    const logic = new WithdrawBaseLogic(chainId);
    const iface = Comet__factory.createInterface();

    const testCases: LogicTestCase<WithdrawBaseLogicFields>[] = [
      {
        fields: {
          marketId: MarketId.USDC,
          input: new common.TokenAmount(mainnetTokens.cUSDCv3, '1'),
          output: new common.TokenAmount(mainnetTokens.USDC, '1'),
        },
      },
      {
        fields: {
          marketId: MarketId.USDC,
          input: new common.TokenAmount(mainnetTokens.cUSDCv3, '1'),
          output: new common.TokenAmount(mainnetTokens.USDC, '1'),
          amountBps: 5000,
        },
      },
      {
        fields: {
          marketId: MarketId.ETH,
          input: new common.TokenAmount(mainnetTokens.cWETHv3, '1'),
          output: new common.TokenAmount(mainnetTokens.ETH, '1'),
        },
      },
      {
        fields: {
          marketId: MarketId.ETH,
          input: new common.TokenAmount(mainnetTokens.cWETHv3, '1'),
          output: new common.TokenAmount(mainnetTokens.ETH, '0'),
          amountBps: 5000,
        },
      },
      {
        fields: {
          marketId: MarketId.ETH,
          input: new common.TokenAmount(mainnetTokens.cWETHv3, '1'),
          output: new common.TokenAmount(mainnetTokens.WETH, '1'),
        },
      },
      {
        fields: {
          marketId: MarketId.ETH,
          input: new common.TokenAmount(mainnetTokens.cWETHv3, '1'),
          output: new common.TokenAmount(mainnetTokens.WETH, '0'),
          amountBps: 5000,
        },
      },
    ];

    testCases.forEach(({ fields }) => {
      it(`withdraw ${fields.output.token.symbol} from ${fields.marketId} market${
        fields.amountBps ? ' with amountBps' : ''
      }`, async function () {
        const routerLogic = await logic.build(fields);
        const sig = routerLogic.data.substring(0, 10);
        const { marketId, input, output, amountBps } = fields;
        const market = getMarket(chainId, marketId);

        expect(routerLogic.to).to.eq(market.cometAddress);
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        expect(sig).to.eq(iface.getSighash('withdraw'));
        if (amountBps) {
          expect(routerLogic.inputs[0].amountBps).to.eq(amountBps);
          expect(routerLogic.inputs[0].amountOrOffset).to.eq(32);
        } else {
          expect(routerLogic.inputs[0].amountBps).to.eq(constants.MaxUint256);
          expect(routerLogic.inputs[0].amountOrOffset).to.eq(input.amountWei);
        }
        expect(routerLogic.wrapMode).to.eq(output.token.isNative ? core.WrapMode.unwrapAfter : core.WrapMode.none);
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

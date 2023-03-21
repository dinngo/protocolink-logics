import { Comet__factory } from './contracts';
import { LogicTestCase } from 'test/types';
import { SupplyBaseLogic, SupplyBaseLogicFields } from './logic.supply-base';
import * as common from '@composable-router/common';
import { constants, utils } from 'ethers';
import { expect } from 'chai';
import { getMarket } from './config';
import { mainnetTokens } from './tokens';

describe('CompoundV3 SupplyBaseLogic', function () {
  context('Test getTokenList', async function () {
    SupplyBaseLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.getNetworkId(chainId)}`, async function () {
        const supplyBaseLogic = new SupplyBaseLogic(chainId);
        const tokenList = await supplyBaseLogic.getTokenList();
        expect(Object.keys(tokenList).length).to.be.gt(0);
        for (const marketId of Object.keys(tokenList)) {
          expect(tokenList[marketId].length).to.eq(2);
        }
      });
    });
  });

  context('Test getLogic', function () {
    const chainId = common.ChainId.mainnet;
    const compoundV3SupplyBaseLogic = new SupplyBaseLogic(chainId);
    const ifaceComet = Comet__factory.createInterface();
    const account = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';

    const testCases: LogicTestCase<SupplyBaseLogicFields>[] = [
      {
        fields: {
          marketId: 'USDC',
          input: new common.TokenAmount(mainnetTokens.USDC, '1'),
          output: new common.TokenAmount(mainnetTokens.cUSDCv3, '0'),
        },
      },
      {
        fields: {
          marketId: 'USDC',
          input: new common.TokenAmount(mainnetTokens.USDC, '1'),
          output: new common.TokenAmount(mainnetTokens.cUSDCv3, '0'),
          amountBps: 5000,
        },
      },
      {
        fields: {
          marketId: 'ETH',
          input: new common.TokenAmount(mainnetTokens.ETH, '1'),
          output: new common.TokenAmount(mainnetTokens.cWETHv3, '0'),
        },
      },
      {
        fields: {
          marketId: 'ETH',
          input: new common.TokenAmount(mainnetTokens.ETH, '1'),
          output: new common.TokenAmount(mainnetTokens.cWETHv3, '0'),
          amountBps: 5000,
        },
      },
    ];

    testCases.forEach(({ fields }) => {
      it(`supply ${fields.input.token.symbol} to ${fields.marketId} market${
        fields.amountBps ? ' with amountBps' : ''
      }`, async function () {
        const routerLogic = await compoundV3SupplyBaseLogic.getLogic(fields, { account });
        const sig = routerLogic.data.substring(0, 10);
        const { marketId, input, output, amountBps } = fields;
        const market = getMarket(chainId, marketId);
        const ifaceBulker = new utils.Interface(market.bulker.abi);

        if (input.token.isNative) {
          expect(routerLogic.to).to.eq(market.bulker.address);
          expect(sig).to.eq(ifaceBulker.getSighash('invoke'));
          expect(routerLogic.inputs[0].token).to.eq(common.ELASTIC_ADDRESS);
        } else {
          expect(routerLogic.to).to.eq(output.token.address);
          expect(sig).to.eq(ifaceComet.getSighash('supply'));
        }
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        if (amountBps) {
          expect(routerLogic.inputs[0].amountBps).to.eq(amountBps);
          expect(routerLogic.inputs[0].amountOrOffset).to.eq(input.token.isNative ? constants.MaxUint256 : 32);
        } else {
          expect(routerLogic.inputs[0].amountBps).to.eq(constants.MaxUint256);
          expect(routerLogic.inputs[0].amountOrOffset).to.eq(input.amountWei);
        }
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

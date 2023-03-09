import { LogicTestCase } from 'test/types';
import { WrappedNativeTokenLogic, WrappedNativeTokenLogicFields } from './logic.wrapped-native-token';
import * as common from '@composable-router/common';
import { constants, utils } from 'ethers';
import { expect } from 'chai';
import { mainnetTokens } from '@composable-router/test-helpers';

describe('Utility WrappedNativeTokenLogic', function () {
  const chainId = common.ChainId.mainnet;
  const wrappedNativeTokenLogic = new WrappedNativeTokenLogic(chainId);

  context('Test getLogic', function () {
    const iface = common.WETH__factory.createInterface();

    const testCases: LogicTestCase<WrappedNativeTokenLogicFields>[] = [
      {
        fields: {
          input: new common.TokenAmount(mainnetTokens.ETH, '1'),
          output: new common.TokenAmount(mainnetTokens.WETH, '1'),
        },
      },
      {
        fields: {
          input: new common.TokenAmount(mainnetTokens.WETH, '1'),
          output: new common.TokenAmount(mainnetTokens.ETH, '1'),
        },
      },
      {
        fields: {
          input: new common.TokenAmount(mainnetTokens.ETH, '1'),
          output: new common.TokenAmount(mainnetTokens.WETH, '1'),
          amountBps: 5000,
        },
      },
      {
        fields: {
          input: new common.TokenAmount(mainnetTokens.WETH, '1'),
          output: new common.TokenAmount(mainnetTokens.ETH, '1'),
          amountBps: 5000,
        },
      },
    ];

    testCases.forEach(({ fields }) => {
      it(`${fields.input.token.symbol} to ${fields.output.token.symbol}${
        fields.amountBps ? ' with amountBps' : ''
      }`, async function () {
        const routerLogic = await wrappedNativeTokenLogic.getLogic(fields);
        const sig = routerLogic.data.substring(0, 10);
        const { input, amountBps } = fields;

        expect(routerLogic.to).to.eq(mainnetTokens.WETH.address);
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        if (input.token.isNative()) {
          expect(sig).to.eq(iface.getSighash('deposit'));
          expect(routerLogic.inputs[0].token).to.eq(common.ELASTIC_ADDRESS);
        } else {
          expect(sig).to.eq(iface.getSighash('withdraw'));
        }
        if (amountBps) {
          expect(routerLogic.inputs[0].amountBps).to.eq(amountBps);
          expect(routerLogic.inputs[0].amountOrOffset).to.eq(input.token.isNative() ? constants.MaxUint256 : 0);
        } else {
          expect(routerLogic.inputs[0].amountBps).to.eq(constants.MaxUint256);
          expect(routerLogic.inputs[0].amountOrOffset).to.eq(input.amountWei);
        }
        expect(routerLogic.outputs).to.deep.eq([]);
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

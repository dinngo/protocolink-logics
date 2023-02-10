import { WrappedNativeTokenLogic } from './logic.wrapped-native-token';
import { constants, utils } from 'ethers';
import * as core from 'src/core';
import { expect } from 'chai';

describe('WrappedNativeTokenLogic', function () {
  const chainId = core.network.ChainId.mainnet;
  const wrappedNativeToken = new WrappedNativeTokenLogic({ chainId });

  context('Test getPrice', function () {
    const cases = [
      { input: new core.tokens.TokenAmount(core.tokens.mainnet.ETH, '1'), tokenOut: core.tokens.mainnet.WETH },
      { input: new core.tokens.TokenAmount(core.tokens.mainnet.WETH, '1'), tokenOut: core.tokens.mainnet.ETH },
    ];

    cases.forEach(({ input, tokenOut }) => {
      it(`${input.token.symbol} to ${tokenOut.symbol}`, async function () {
        const output = await wrappedNativeToken.getPrice({ input, tokenOut });
        expect(output.amount).to.eq(input.amount);
      });
    });
  });

  context('Test getLogic', function () {
    const iface = core.contracts.WETH__factory.createInterface();

    const cases = [
      {
        input: new core.tokens.TokenAmount(core.tokens.mainnet.ETH, '1'),
        output: new core.tokens.TokenAmount(core.tokens.mainnet.WETH, '1'),
      },
      {
        input: new core.tokens.TokenAmount(core.tokens.mainnet.WETH, '1'),
        output: new core.tokens.TokenAmount(core.tokens.mainnet.ETH, '1'),
      },
      {
        input: new core.tokens.TokenAmount(core.tokens.mainnet.ETH, '1'),
        output: new core.tokens.TokenAmount(core.tokens.mainnet.WETH, '1'),
        amountBps: 5000,
      },
      {
        input: new core.tokens.TokenAmount(core.tokens.mainnet.WETH, '1'),
        output: new core.tokens.TokenAmount(core.tokens.mainnet.ETH, '1'),
        amountBps: 5000,
      },
    ];

    cases.forEach(({ input, output, amountBps }) => {
      it(`${input.token.symbol} to ${output.token.symbol}${amountBps ? ' with amountBps' : ''}`, async function () {
        const logic = await wrappedNativeToken.getLogic({ input, output, amountBps });
        const sig = logic.data.substring(0, 10);

        expect(logic.to).to.eq(core.tokens.mainnet.WETH.address);
        expect(utils.isBytesLike(logic.data)).to.be.true;
        if (input.token.isNative()) {
          expect(sig).to.eq(iface.getSighash('deposit'));
          expect(logic.inputs[0].token).to.eq(core.tokens.ELASTIC_ADDRESS);
          expect(logic.inputs[0].doApprove).to.be.false;
        } else {
          expect(sig).to.eq(iface.getSighash('withdraw'));
          expect(logic.inputs[0].doApprove).to.be.true;
        }
        if (amountBps) {
          expect(logic.inputs[0].amountBps).to.eq(amountBps);
          expect(logic.inputs[0].amountOrOffset).to.eq(input.token.isNative() ? constants.MaxUint256 : 0);
        } else {
          expect(logic.inputs[0].amountBps).to.eq(constants.MaxUint256);
          expect(logic.inputs[0].amountOrOffset).to.eq(input.amountWei);
        }
        expect(logic.outputs).to.deep.eq([]);
        expect(logic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

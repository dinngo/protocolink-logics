import { BPS_BASE, ELASTIC_ADDRESS, ETH_MAINNET, TokenAmount, TokenAmounts, WETH_MAINNET } from 'src/core';
import { BigNumber, constants, utils } from 'ethers';
import { WETH__factory } from './contracts';
import { WrappedNativeTokenLogic } from './logic.wrapped-native-token';
import { expect } from 'chai';

describe('WrappedNativeTokenLogic', () => {
  describe('Test getPrice', () => {
    const chainId = 1;
    const logic = new WrappedNativeTokenLogic({ chainId });

    const cases = [
      { input: new TokenAmount(ETH_MAINNET, '1'), tokenOut: WETH_MAINNET },
      { input: new TokenAmount(WETH_MAINNET, '1'), tokenOut: ETH_MAINNET },
    ];

    cases.forEach(({ input, tokenOut }) => {
      it(`${input.token.symbol} to ${tokenOut.symbol}`, async function () {
        const output = await logic.getPrice({ input, tokenOut });
        expect(output.amount).to.eq(input.amount);
      });
    });
  });

  describe('Test getLogic', () => {
    const chainId = 1;
    const logic = new WrappedNativeTokenLogic({ chainId });
    const iface = WETH__factory.createInterface();

    const cases = [
      {
        funds: new TokenAmounts([new TokenAmount(ETH_MAINNET, '1')]),
        input: new TokenAmount(ETH_MAINNET, '1'),
        output: new TokenAmount(WETH_MAINNET, '1'),
      },
      {
        funds: new TokenAmounts([new TokenAmount(WETH_MAINNET, '1')]),
        input: new TokenAmount(WETH_MAINNET, '1'),
        output: new TokenAmount(ETH_MAINNET, '1'),
      },
    ];

    cases.forEach(({ input, output, ...others }) => {
      it(`${input.token.symbol} to ${output.token.symbol}`, async function () {
        const routerLogic = await logic.getLogic({ input, output, ...others });
        const sig = routerLogic.data.substring(0, 10);

        expect(routerLogic.to).to.eq(WETH_MAINNET.address);
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        if (input.token.isNative()) {
          expect(sig).to.eq(iface.getSighash('deposit'));
          expect(routerLogic.inputs[0].token).to.eq(ELASTIC_ADDRESS);
          expect(routerLogic.inputs[0].doApprove).to.be.false;
        } else {
          expect(sig).to.eq(iface.getSighash('withdraw'));
          expect(routerLogic.inputs[0].doApprove).to.be.true;
        }
        expect(BigNumber.from(routerLogic.inputs[0].amountBps).eq(BPS_BASE)).to.be.true;
        expect(BigNumber.from(routerLogic.inputs[0].amountOffset).eq(constants.MaxUint256)).to.be.true;
        expect(routerLogic.outputs).to.deep.eq([]);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

import { BPS_BASE, ELASTIC_ADDRESS, ETH_MAINNET, TokenAmount, TokenAmounts, WETH_MAINNET } from 'src/core';
import { BigNumber, constants, utils } from 'ethers';
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

    const cases = [
      {
        account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        funds: new TokenAmounts([new TokenAmount(ETH_MAINNET, '1')]),
        slippage: 0,
        input: new TokenAmount(ETH_MAINNET, '1'),
        output: new TokenAmount(WETH_MAINNET, '1'),
      },
      {
        account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        funds: new TokenAmounts([new TokenAmount(WETH_MAINNET, '1')]),
        slippage: 0,
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
          expect(sig).to.eq('0xd0e30db0');
          expect(routerLogic.inputs[0].token).to.eq(ELASTIC_ADDRESS);
          expect(routerLogic.inputs[0].doApprove).to.be.false;
        } else {
          expect(sig).to.eq('0x2e1a7d4d');
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

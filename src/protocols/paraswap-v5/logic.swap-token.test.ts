import { BPS_BASE, DAI_MAINNET, ELASTIC_ADDRESS, ETH_MAINNET, TokenAmount, TokenAmounts, USDC_MAINNET } from 'src/core';
import { BigNumber, constants, utils } from 'ethers';
import { ParaswapV5SwapTokenLogic } from './logic.swap-token';
import { expect } from 'chai';

describe('ParaswapV5SwapTokenLogic', function () {
  describe('Test getPrice', function () {
    const chainId = 1;
    const logic = new ParaswapV5SwapTokenLogic({ chainId });

    const cases = [
      { input: new TokenAmount(ETH_MAINNET, '1'), tokenOut: USDC_MAINNET },
      { input: new TokenAmount(USDC_MAINNET, '1'), tokenOut: ETH_MAINNET },
      { input: new TokenAmount(USDC_MAINNET, '1'), tokenOut: DAI_MAINNET },
    ];

    cases.forEach(({ input, tokenOut }) => {
      it(`${input.token.symbol} to ${tokenOut.symbol}`, async function () {
        const output = await logic.getPrice({ input, tokenOut });
        expect(output.amountWei.gt(0)).to.be.true;
      });
    });
  });

  describe('Test getLogic', () => {
    const chainId = 1;
    const logic = new ParaswapV5SwapTokenLogic({ chainId });

    const cases = [
      {
        account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        funds: new TokenAmounts([new TokenAmount(ETH_MAINNET, '1')]),
        slippage: 500,
        input: new TokenAmount(ETH_MAINNET, '1'),
        output: new TokenAmount(USDC_MAINNET),
      },
      {
        account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        funds: new TokenAmounts([new TokenAmount(USDC_MAINNET, '1')]),
        slippage: 500,
        input: new TokenAmount(USDC_MAINNET, '1'),
        output: new TokenAmount(ETH_MAINNET),
      },
      {
        account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        funds: new TokenAmounts([new TokenAmount(USDC_MAINNET, '1')]),
        slippage: 500,
        input: new TokenAmount(USDC_MAINNET, '1'),
        output: new TokenAmount(DAI_MAINNET),
      },
    ];

    cases.forEach(({ input, output, ...others }) => {
      it(`${input.token.symbol} to ${output.token.symbol}`, async function () {
        const routerLogic = await logic.getLogic({ input, output, ...others });

        expect(routerLogic.to).to.eq('0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57');
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        if (input.token.isNative()) {
          expect(routerLogic.inputs[0].token).to.eq(ELASTIC_ADDRESS);
          expect(routerLogic.inputs[0].doApprove).to.be.false;
        } else {
          expect(routerLogic.inputs[0].doApprove).to.be.true;
        }
        expect(BigNumber.from(routerLogic.inputs[0].amountBps).eq(BPS_BASE)).to.be.true;
        expect(BigNumber.from(routerLogic.inputs[0].amountOffset).eq(constants.MaxUint256)).to.be.true;
        if (output.token.isNative()) {
          expect(routerLogic.outputs[0].token).to.eq(ELASTIC_ADDRESS);
        }
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

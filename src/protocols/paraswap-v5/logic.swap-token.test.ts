import { BPS_BASE, DAI_MAINNET, ELASTIC_ADDRESS, ETH_MAINNET, TokenAmount, TokenAmounts, USDC_MAINNET } from 'src/core';
import { BigNumber, constants, utils } from 'ethers';
import {
  ParaswapV5SwapTokenLogic,
  ParaswapV5SwapTokenLogicGetLogicOptions,
  ParaswapV5SwapTokenLogicGetPriceOptions,
} from './logic.swap-token';

describe('ParaswapV5SwapTokenLogic', () => {
  describe('Test getPrice', () => {
    const chainId = 1;
    const logic = new ParaswapV5SwapTokenLogic({ chainId });

    test.each<{ name: string; options: ParaswapV5SwapTokenLogicGetPriceOptions }>([
      {
        name: 'ETH to USDC',
        options: {
          input: new TokenAmount(ETH_MAINNET, '1'),
          tokenOut: USDC_MAINNET,
        },
      },
      {
        name: 'USDC to ETH',
        options: {
          input: new TokenAmount(USDC_MAINNET, '1'),
          tokenOut: ETH_MAINNET,
        },
      },
      {
        name: 'USDC to DAI',
        options: {
          input: new TokenAmount(USDC_MAINNET, '1'),
          tokenOut: DAI_MAINNET,
        },
      },
    ])(
      'case $#: $name',
      async ({ options }) => {
        const output = await logic.getPrice(options);
        expect(output.amountWei.gt(0)).toBeTruthy();
      },
      30000
    );
  });

  describe('Test getLogic', () => {
    const chainId = 1;
    const logic = new ParaswapV5SwapTokenLogic({ chainId });

    test.each<{ name: string; options: ParaswapV5SwapTokenLogicGetLogicOptions }>([
      {
        name: 'ETH to USDC',
        options: {
          account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
          funds: new TokenAmounts([new TokenAmount(ETH_MAINNET, '1')]),
          slippage: 500,
          input: new TokenAmount(ETH_MAINNET, '1'),
          output: new TokenAmount(USDC_MAINNET),
        },
      },
      {
        name: 'USDC to ETH',
        options: {
          account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
          funds: new TokenAmounts([new TokenAmount(USDC_MAINNET, '1')]),
          slippage: 500,
          input: new TokenAmount(USDC_MAINNET, '1'),
          output: new TokenAmount(ETH_MAINNET),
        },
      },
      {
        name: 'USDC to DAI',
        options: {
          account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
          funds: new TokenAmounts([new TokenAmount(USDC_MAINNET, '1')]),
          slippage: 500,
          input: new TokenAmount(USDC_MAINNET, '1'),
          output: new TokenAmount(DAI_MAINNET),
        },
      },
    ])(
      'case $#: $name',
      async ({ options }) => {
        const routerLogic = await logic.getLogic(options);

        expect(routerLogic.to).toBe('0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57');
        expect(utils.isBytesLike(routerLogic.data)).toBeTruthy();
        if (options.input.token.isNative()) {
          expect(routerLogic.inputs[0].token).toBe(ELASTIC_ADDRESS);
          expect(routerLogic.inputs[0].doApprove).toBeFalsy();
        } else {
          expect(routerLogic.inputs[0].doApprove).toBeTruthy();
        }
        expect(BigNumber.from(routerLogic.inputs[0].amountBps).eq(BPS_BASE)).toBeTruthy();
        expect(BigNumber.from(routerLogic.inputs[0].amountOffset).eq(constants.MaxUint256)).toBeTruthy();
        if (options.output.token.isNative()) {
          expect(routerLogic.outputs[0].token).toBe(ELASTIC_ADDRESS);
        }
        expect(routerLogic.callback).toBe(constants.AddressZero);
      },
      30000
    );
  });
});

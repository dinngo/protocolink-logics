import { BPS_BASE, ELASTIC_ADDRESS, ETH_MAINNET, TokenAmount, TokenAmounts, WETH_MAINNET } from 'src/core';
import { BigNumber, constants, utils } from 'ethers';
import {
  WrappedNativeTokenLogic,
  WrappedNativeTokenLogicGetLogicOptions,
  WrappedNativeTokenLogicGetPriceOptions,
} from './logic.wrapped-native-token';

describe('WrappedNativeTokenLogic', () => {
  describe('Test getPrice', () => {
    const chainId = 1;
    const logic = new WrappedNativeTokenLogic({ chainId });

    test.each<{ name: string; options: WrappedNativeTokenLogicGetPriceOptions }>([
      {
        name: 'Native to Wrapped',
        options: {
          input: new TokenAmount(ETH_MAINNET, '1'),
          tokenOut: WETH_MAINNET,
        },
      },
      {
        name: 'Wrapped to Native',
        options: {
          input: new TokenAmount(WETH_MAINNET, '1'),
          tokenOut: ETH_MAINNET,
        },
      },
    ])(
      'case $#: $name',
      async ({ options }) => {
        const output = await logic.getPrice(options);
        expect(output.amount).toBe(options.input.amount);
      },
      30000
    );
  });

  describe('Test getLogic', () => {
    const chainId = 1;
    const logic = new WrappedNativeTokenLogic({ chainId });

    test.each<{ name: string; options: WrappedNativeTokenLogicGetLogicOptions }>([
      {
        name: 'Native to Wrapped',
        options: {
          account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
          funds: new TokenAmounts([new TokenAmount(ETH_MAINNET, '1')]),
          slippage: 0,
          input: new TokenAmount(ETH_MAINNET, '1'),
          output: new TokenAmount(WETH_MAINNET, '1'),
        },
      },
      {
        name: 'Wrapped to Native',
        options: {
          account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
          funds: new TokenAmounts([new TokenAmount(WETH_MAINNET, '1')]),
          slippage: 0,
          input: new TokenAmount(WETH_MAINNET, '1'),
          output: new TokenAmount(ETH_MAINNET, '1'),
        },
      },
    ])('case $#: $name', async ({ options }) => {
      const routerLogic = await logic.getLogic(options);
      const sig = routerLogic.data.substring(0, 10);

      expect(routerLogic.to).toBe(WETH_MAINNET.address);
      expect(utils.isBytesLike(routerLogic.data)).toBeTruthy();
      if (options.input.token.isNative()) {
        expect(sig).toBe('0xd0e30db0');
        expect(routerLogic.inputs[0].token).toBe(ELASTIC_ADDRESS);
        expect(routerLogic.inputs[0].doApprove).toBeFalsy();
      } else {
        expect(sig).toBe('0x2e1a7d4d');
        expect(routerLogic.inputs[0].doApprove).toBeTruthy();
      }
      expect(BigNumber.from(routerLogic.inputs[0].amountBps).eq(BPS_BASE)).toBeTruthy();
      expect(BigNumber.from(routerLogic.inputs[0].amountOffset).eq(constants.MaxUint256)).toBeTruthy();
      expect(routerLogic.outputs).toStrictEqual([]);
      expect(routerLogic.callback).toBe(constants.AddressZero);
    });
  });
});

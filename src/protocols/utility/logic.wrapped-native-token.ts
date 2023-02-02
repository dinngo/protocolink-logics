import {
  LogicBase,
  LogicGlobalOptions,
  TokenAmount,
  TokenToTokenData,
  TokenToTokenExactInData,
  TokenToTokenLogicInterface,
  newLogicInput,
} from 'src/core';
import { WETH__factory } from './contracts';
import { constants } from 'ethers';

export type WrappedNativeTokenLogicGetPriceOptions = TokenToTokenExactInData;

export type WrappedNativeTokenLogicGetLogicOptions = TokenToTokenData & Pick<LogicGlobalOptions, 'funds'>;

export class WrappedNativeTokenLogic extends LogicBase implements TokenToTokenLogicInterface {
  async getPrice(options: WrappedNativeTokenLogicGetPriceOptions) {
    const { input, tokenOut } = options;
    const output = new TokenAmount(tokenOut, input.amount);
    return output;
  }

  async getLogic(options: WrappedNativeTokenLogicGetLogicOptions) {
    const { funds, input } = options;

    const iface = WETH__factory.createInterface();
    const data = input.token.isNative()
      ? iface.encodeFunctionData('deposit')
      : iface.encodeFunctionData('withdraw', [input.amountWei]);

    return {
      to: this.networkConfig.wrappedNativeToken.address,
      data,
      inputs: [newLogicInput({ funds, input })],
      outputs: [],
      callback: constants.AddressZero,
    };
  }
}

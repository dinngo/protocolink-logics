import { BigNumberish, constants } from 'ethers';
import { IRouter } from '@composable-router/contracts/typechain';
import { TokenAmount, TokenAmounts } from '../tokens';
import { calcAmountBps, calcAmountMin } from './utils';

export interface NewLogicInputOptions {
  funds: TokenAmounts;
  input: TokenAmount;
  amountOffset?: BigNumberish;
}

export function newLogicInput(options: NewLogicInputOptions): IRouter.InputStruct {
  const { funds, input, amountOffset } = options;

  return {
    token: input.token.elasticAddress,
    amountBps: calcAmountBps(input.amountWei, funds.get(input.token).amountWei),
    amountOffset: amountOffset ? amountOffset : constants.MaxUint256,
    doApprove: !input.token.isNative(),
  };
}

export interface NewLogicOutputOptions {
  output: TokenAmount;
  slippage: number;
}

export function newLogicOutput(options: NewLogicOutputOptions): IRouter.OutputStruct {
  const { output, slippage } = options;

  return {
    token: output.token.elasticAddress,
    amountMin: calcAmountMin(output.amountWei, slippage),
  };
}

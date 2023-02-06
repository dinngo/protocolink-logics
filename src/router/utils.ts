import { BigNumber, BigNumberish } from 'ethers';
import * as constants from './constants';
import * as core from 'src/core';

export function calcAmountBps(amountWei: BigNumberish, balanceWei: BigNumberish) {
  return BigNumber.from(amountWei).mul(constants.BPS_BASE).div(balanceWei);
}

export function calcAmountMin(amountWei: BigNumberish, slippage: number) {
  return BigNumber.from(amountWei)
    .mul(constants.BPS_BASE - slippage)
    .div(constants.BPS_BASE);
}

export function toTokensReturn(balances: core.tokens.TokenAmounts) {
  return balances.toArray().reduce((accumulator, tokenAmount) => {
    accumulator.push(tokenAmount.token.elasticAddress);
    return accumulator;
  }, [] as string[]);
}

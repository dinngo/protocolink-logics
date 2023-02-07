import { BPS_BASE } from './constants';
import { BigNumber, BigNumberish, constants } from 'ethers';
import * as core from 'src/core';

export function calcAmountBps(amountWei: BigNumberish, balanceWei: BigNumberish) {
  return BigNumber.from(amountWei).mul(BPS_BASE).div(balanceWei);
}

export function validateAmountBps(amountBps: BigNumberish) {
  amountBps = BigNumber.from(amountBps);
  return (amountBps.gt(0) && amountBps.lte(BPS_BASE)) || amountBps.eq(constants.MaxUint256);
}

export function calcAmountMin(amountWei: BigNumberish, slippage: number) {
  return BigNumber.from(amountWei)
    .mul(BPS_BASE - slippage)
    .div(BPS_BASE);
}

export function toTokensReturn(balances: core.tokens.TokenAmounts) {
  return balances.toArray().reduce((accumulator, tokenAmount) => {
    accumulator.push(tokenAmount.token.elasticAddress);
    return accumulator;
  }, [] as string[]);
}

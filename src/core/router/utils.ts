import { BPS_BASE } from './constants';
import { BigNumber } from 'ethers';

export function calcAmountBps(amountWei: BigNumber, balanceWei: BigNumber) {
  return amountWei.mul(BPS_BASE).div(balanceWei);
}

export function calcAmountMin(amountWei: BigNumber, slippage: number) {
  return amountWei.mul(BPS_BASE - slippage).div(BPS_BASE);
}

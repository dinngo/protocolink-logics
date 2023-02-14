import * as core from 'src/core';
import * as rt from 'src/router';

export function calcRequiredFundByAmountBps(input: core.tokens.TokenAmount, amountBps: number) {
  const requiredAmountWei = input.amountWei.mul(rt.constants.BPS_BASE).div(amountBps);
  const requiredFund = new core.tokens.TokenAmount(input.token).setWei(requiredAmountWei);
  return reduiredFund;
}

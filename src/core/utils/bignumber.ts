import { BigNumber, BigNumberish, utils } from 'ethers';
import BigNumberJS from 'bignumber.js';

export function toSmallUnit(amount: string, decimals: number) {
  return Number(amount) > 0
    ? utils.parseUnits(new BigNumberJS(amount).decimalPlaces(decimals, BigNumberJS.ROUND_DOWN).toString(), decimals)
    : BigNumber.from(0);
}

export interface ToBigUnitOptions {
  displayDecimals?: number;
  mode?: 'ceil' | 'round' | 'floor';
}

export function toBigUnit(amountWei: BigNumberish, decimals: number, options: ToBigUnitOptions = {}) {
  const { displayDecimals, mode } = options;

  return new BigNumberJS(amountWei.toString())
    .shiftedBy(-decimals)
    .decimalPlaces(
      displayDecimals ? displayDecimals : decimals,
      mode === 'round' ? BigNumberJS.ROUND_HALF_UP : mode === 'ceil' ? BigNumberJS.ROUND_CEIL : BigNumberJS.ROUND_FLOOR
    )
    .toString();
}

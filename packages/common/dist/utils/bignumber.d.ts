import { BigNumber, BigNumberish } from 'ethers';
export declare function toSmallUnit(amount: string, decimals: number): BigNumber;
export interface ToBigUnitOptions {
    displayDecimals?: number;
    mode?: string | 'ceil' | 'round' | 'floor';
}
export declare function toBigUnit(amountWei: BigNumberish, decimals: number, options?: ToBigUnitOptions): string;
export declare function calcSlippage(amountWei: BigNumberish, slippage: number, base?: number): BigNumber;
export declare function calcFee(amountWei: BigNumberish, premium: number, base?: number): BigNumber;

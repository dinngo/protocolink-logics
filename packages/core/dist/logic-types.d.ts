import { BigNumberish } from 'ethers';
import * as common from '@composable-router/common';
export interface GlobalOptions {
    readonly account: string;
    readonly funds: common.TokenAmounts;
    readonly balances: common.TokenAmounts;
    readonly slippage: number;
}
export declare enum WrapMode {
    none = 0,
    wrapBefore = 1,
    unwrapAfter = 2
}
export declare enum TradeType {
    exactIn = "exactIn",
    exactOut = "exactOut"
}
export type TokenToTokenExactInParams<T = object> = {
    input: common.TokenAmount;
    tokenOut: common.Token;
} & T;
export type TokenToTokenExactOutParams<T = object> = {
    tokenIn: common.Token;
    output: common.TokenAmount;
} & T;
export type TokenToTokenParams<T = object> = (TokenToTokenExactInParams | TokenToTokenExactOutParams) & T;
export declare function isTokenToTokenExactInParams<T = object>(v: any): v is TokenToTokenExactInParams<T>;
export declare function isTokenToTokenExactOutParams<T = object>(v: any): v is TokenToTokenExactOutParams<T>;
export type TokenToTokenExactInFields<T = object> = {
    input: common.TokenAmount;
    output: common.TokenAmount;
    amountBps?: BigNumberish;
} & T;
export type TokenToTokenFields<T = object> = {
    tradeType: TradeType;
    input: common.TokenAmount;
    output: common.TokenAmount;
    amountBps?: BigNumberish;
} & T;
export type TokenInParams<T = object> = {
    tokenIn: common.Token;
} & T;
export type TokenInFields<T = object> = {
    input: common.TokenAmount;
    amountBps?: BigNumberish;
} & T;
export type TokensInFields<T = object> = {
    inputs: common.TokenAmounts;
    amountsBps?: Record<number, BigNumberish>;
} & T;
export type TokenOutParams<T = object> = {
    tokenOut: common.Token;
} & T;
export type TokenOutFields<T = object> = {
    output: common.TokenAmount;
} & T;
export type TokensOutFields<T = object> = {
    outputs: common.TokenAmounts;
} & T;
export type TokenToUserFields<T = object> = {
    input: common.TokenAmount;
    recipient: string;
    amountBps?: BigNumberish;
} & T;
export type RepayParams<T = object> = TokenInParams<{
    borrower: string;
}> & T;
export type RepayFields<T = object> = TokenInFields<{
    borrower: string;
}> & T;
export type ClaimParams<T = object> = {
    owner: string;
} & T;
export type ClaimFields<T = object> = TokenOutFields<{
    owner: string;
}> & T;
export type FlashLoanFields<T = object> = TokensOutFields<{
    params: string;
}> & T;

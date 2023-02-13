import { BigNumberish } from 'ethers';
import * as core from 'src/core';

export interface TokenInData {
  input: core.tokens.TokenAmount;
  amountBps?: BigNumberish;
}

export interface TokenOutData {
  output: core.tokens.TokenAmount;
}

export interface TokensOutData {
  outputs: core.tokens.TokenAmount[];
}

export interface TokenToTokenExactInData {
  input: core.tokens.TokenAmount;
  tokenOut: core.tokens.Token;
}

export interface TokenToTokenExactOutData {
  tokenIn: core.tokens.Token;
  output: core.tokens.TokenAmount;
}

export interface TokenToTokenData {
  input: core.tokens.TokenAmount;
  output: core.tokens.TokenAmount;
  amountBps?: BigNumberish;
}

export interface TokenToTokenLogicInterface {
  getPrice(options: unknown): unknown;
}

export interface TokenToUserData {
  input: core.tokens.TokenAmount;
  recipient: string;
  amountBps?: BigNumberish;
}

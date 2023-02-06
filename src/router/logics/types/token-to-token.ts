import * as core from 'src/core';

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
}

export interface TokenToTokenLogicInterface {
  getPrice(options: unknown): unknown;
}

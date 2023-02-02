import { Token, TokenAmount } from '../tokens';

export interface TokenToTokenExactInData {
  input: TokenAmount;
  tokenOut: Token;
}

export interface TokenToTokenExactOutData {
  tokenIn: Token;
  output: TokenAmount;
}

export interface TokenToTokenData {
  input: TokenAmount;
  output: TokenAmount;
}

export interface TokenToTokenLogicInterface {
  getPrice(options: unknown): unknown;
}

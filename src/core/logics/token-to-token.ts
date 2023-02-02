import { Token, TokenAmount } from '../tokens';

export type TokenToTokenExactInData<T extends object = object> = {
  input: TokenAmount;
  tokenOut: Token;
} & T;

export type TokenToTokenExactOutData<T extends object = object> = {
  tokenIn: Token;
  output: TokenAmount;
} & T;

export type TokenToTokenData<T extends object = object> = {
  input: TokenAmount;
  output: TokenAmount;
} & T;

export interface TokenToTokenLogicInterface {
  getPrice(options: unknown): unknown;
}

import { TokenAmounts } from 'src/core';

export interface LogicGlobalOptions {
  account: string;
  funds: TokenAmounts;
  slippage: number;
}

import * as core from 'src/core';

export interface RouterGlobalOptions {
  account: string;
  funds: core.tokens.TokenAmounts;
  balances: core.tokens.TokenAmounts;
  slippage: number;
}

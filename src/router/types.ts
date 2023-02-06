import * as core from 'src/core';

export interface RouterGlobalOptions {
  routerAddress: string;
  account: string;
  funds: core.tokens.TokenAmounts;
  balances: core.tokens.TokenAmounts;
  slippage: number;
}

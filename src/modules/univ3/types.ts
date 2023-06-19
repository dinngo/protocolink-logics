import { FeeAmount } from '@uniswap/v3-sdk';
import { Token } from '@uniswap/sdk-core';
import * as core from '@furucombo/composable-router-core';

export interface Config {
  chainId: number;
  factoryAddress: string;
  quoter: { address: string; isV2: boolean };
  swapRouterAddress: string;
  feeAmounts: FeeAmount[];
  bases: Token[];
  additionalBases?: { [key in string]?: Token[] };
  customBases?: { [key in string]?: Token[] };
}

export type SwapTokenLogicParams = core.TokenToTokenParams<{ slippage?: number }>;

export type SwapTokenLogicSingleHopFields = core.TokenToTokenFields<{ fee: number; slippage?: number }>;

export type SwapTokenLogicMultiHopFields = core.TokenToTokenFields<{ path: string; slippage?: number }>;

export type SwapTokenLogicFields = SwapTokenLogicSingleHopFields | SwapTokenLogicMultiHopFields;

export type SwapTokenLogicOptions = Pick<core.GlobalOptions, 'account'>;

export function isSwapTokenLogicSingleHopFields(v: any): v is SwapTokenLogicSingleHopFields {
  return !!v.fee;
}

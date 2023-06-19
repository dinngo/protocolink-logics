import * as common from '@furucombo/composable-router-common';

export interface ReserveTokensAddress {
  assetAddress: string;
  aTokenAddress: string;
  stableDebtTokenAddress: string;
  variableDebtTokenAddress: string;
}

export interface ReserveTokens {
  asset: common.Token;
  aToken: common.Token;
  stableDebtToken: common.Token;
  variableDebtToken: common.Token;
}

export enum InterestRateMode {
  none = 0,
  stable = 1,
  variable = 2,
}

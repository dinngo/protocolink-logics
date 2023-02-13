export interface ReserveTokensAddress {
  assetAddress: string;
  aTokenAddress: string;
  stableDebtTokenAddress: string;
  variableDebtTokenAddress: string;
}

export enum InterestRateMode {
  none = 0,
  stable = 1,
  variable = 2,
}

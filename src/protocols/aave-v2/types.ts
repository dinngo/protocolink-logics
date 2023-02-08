export interface ReserveTokensAddress {
  assetAddress: string;
  aTokenAddress: string;
  stableDebtTokenAddress: string;
  variableDebtTokenAddress: string;
}

export enum InterestRateMode {
  stable = 1,
  variable = 2,
}

import * as common from '@protocolink/common';

export interface ReserveTokensAddress {
  assetAddress: string;
  rTokenAddress: string;
  stableDebtTokenAddress: string;
  variableDebtTokenAddress: string;
}

export interface ReserveTokens {
  asset: common.Token;
  rToken: common.Token;
  stableDebtToken: common.Token;
  variableDebtToken: common.Token;
}

export enum InterestRateMode {
  none = 0,
  stable = 1,
  variable = 2,
}

export interface FlashLoanAssetInfo {
  isActive: boolean;
  availableToBorrow: common.TokenAmount;
}

export interface FlashLoanConfiguration {
  feeBps: number;
  assetInfos: FlashLoanAssetInfo[];
}

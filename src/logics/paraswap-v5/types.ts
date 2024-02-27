// https://github.com/paraswap/paraswap-core/blob/master/src/types.ts

import { SwapSide } from './constants';

export type Address = string;
export type NumberAsString = string;

export type Adapters = {
  [exchangeKey: string]: { adapter: Address; index: number }[];
};

export type OptimalRoute = {
  percent: number;
  swaps: OptimalSwap[];
};

export type OptimalSwap = {
  srcToken: Address;
  srcDecimals: number;
  destToken: Address;
  destDecimals: number;
  swapExchanges: OptimalSwapExchange<any>[];
};

export type OptimalSwapExchange<T> = {
  exchange: string;
  srcAmount: NumberAsString;
  destAmount: NumberAsString;
  percent: number;
  data?: T;
  poolAddresses?: Array<Address>;
};

export type OptionalRate = {
  exchange: string;
  srcAmount: NumberAsString;
  destAmount: NumberAsString;
  unit?: NumberAsString;
  data?: any;
};

export type OptimalRate = {
  blockNumber: number;
  network: number;
  srcToken: Address;
  srcDecimals: number;
  srcAmount: NumberAsString;
  srcUSD: NumberAsString;
  destToken: Address;
  destDecimals: number;
  destAmount: NumberAsString;
  destUSD: NumberAsString;
  bestRoute: OptimalRoute[];
  gasCostUSD: NumberAsString;
  gasCost: NumberAsString;
  gasCostL1Wei?: string; // L1 surcharge on optimism
  others?: OptionalRate[];
  side: SwapSide;
  contractMethod: string;
  tokenTransferProxy: Address;
  contractAddress: Address;
  maxImpact?: number;
  maxUSDImpact?: number;
  maxImpactReached?: boolean;
  partner?: string;
  partnerFee: number;
  hmac: string;
};

export type PriceQueryParams = {
  srcToken: string;
  destToken: string;
  srcDecimals: string;
  destDecimals: string;
  amount: string;
  side?: SwapSide;
  network: string;
};

export interface BuildTxBody {
  srcToken: Address;
  destToken: Address;
  srcAmount: NumberAsString;
  destAmount?: NumberAsString;
  priceRoute: OptimalRate;
  userAddress: Address;
  partner?: string;
  partnerAddress?: string;
  slippage?: number;
  deadline?: number;
  receiver?: Address;
  srcDecimals?: number;
  destDecimals?: number;
}

export interface TransactionParams {
  to: Address;
  from: Address;
  value: NumberAsString;
  data: string;
  gasPrice: NumberAsString;
  gas?: NumberAsString;
  chainId: number;
}

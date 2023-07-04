import { BigNumber, BigNumberish } from 'ethers';

export interface RoutePool {
  pool: string;
  tokenA: string;
  tokenB: string;
  poolType: number;
  reserveA: BigNumber;
  reserveB: BigNumber;
  swapFeeAB: number;
  swapFeeBA: number;
}

export interface RoutePools {
  poolsDirect: RoutePool[];
  poolsA: RoutePool[];
  poolsB: RoutePool[];
  poolsBase: RoutePool[];
}

export interface Step {
  routePool: RoutePool;
  tokenIn: string;
  swapFee: number;
}

export interface StepWithAmount extends Step {
  amountIn: BigNumber;
  updatedStep: Step | null;
}

export interface Path {
  steps: Step[];
}

export interface PathWithAmounts {
  stepsWithAmount: StepWithAmount[];
  amountIn: BigNumber;
  amountOut: BigNumber;
}

export interface GetAmountParams {
  stable: boolean;
  amount: BigNumber;
  reserveIn: BigNumber;
  reserveOut: BigNumber;
  swapFee: BigNumber;
  tokenInPrecisionMultiplier?: BigNumber;
  tokenOutPrecisionMultiplier?: BigNumber;
}

export interface GroupAmounts {
  pathsWithAmounts: PathWithAmounts[];
  amountOut: BigNumber;
}

export interface SwapPath {
  steps: { pool: string; tokenIn: string }[];
  tokenIn: string;
  amountIn: BigNumberish;
}

export interface BestPathsWithAmounts {
  amountOut: BigNumber;
  paths: SwapPath[];
}

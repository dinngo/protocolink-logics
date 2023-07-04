import {
  BestPathsWithAmounts,
  GetAmountParams,
  GroupAmounts,
  Path,
  PathWithAmounts,
  RoutePool,
  RoutePools,
  Step,
  StepWithAmount,
  SwapPath,
} from './types';
import { BigNumber, constants, utils } from 'ethers';
import {
  FOUR,
  LIQUIDITY_MIN_RESERVE,
  MAX_FEE,
  MAX_LOOP_LIMIT,
  MAX_XP,
  ONE,
  STABLE_POOL_A,
  THREE,
  TWO,
  UINT128_MAX,
  UINT256_MAX,
  ZERO,
} from './constants';
import { IRouter } from './contracts/Router';
import { RouteHelper } from './contracts';
import { getToken } from './configs';

function normalizePools(routePools: RouteHelper.RoutePoolStructOutput[]) {
  return routePools.map((routePool) => ({
    pool: routePool.pool,
    tokenA: routePool.tokenA,
    tokenB: routePool.tokenB,
    poolType: routePool.poolType,
    reserveA: routePool.reserveA,
    reserveB: routePool.reserveB,
    swapFeeAB: routePool.swapFeeAB,
    swapFeeBA: routePool.swapFeeBA,
  }));
}

export function normalizeRoutePools(routePools: RouteHelper.RoutePoolsStructOutput): RoutePools {
  return {
    poolsDirect: normalizePools(routePools.poolsDirect),
    poolsA: normalizePools(routePools.poolsA),
    poolsB: normalizePools(routePools.poolsB),
    poolsBase: normalizePools(routePools.poolsBase),
  };
}

function hasLiquidity(routePool: RoutePool, tokenIn?: string, amountOut?: BigNumber) {
  if (tokenIn && amountOut) {
    const reserveOut = routePool.tokenA === tokenIn ? routePool.reserveB : routePool.reserveA;
    return reserveOut.gt(amountOut);
  }

  return routePool.reserveA.gte(LIQUIDITY_MIN_RESERVE) && routePool.reserveB.gte(LIQUIDITY_MIN_RESERVE);
}

function createPath(steps: Omit<Step, 'swapFee'>[]): Path {
  return {
    steps: steps.map(({ routePool, tokenIn }) => ({
      routePool,
      tokenIn,
      swapFee: tokenIn === routePool.tokenA ? routePool.swapFeeAB : routePool.swapFeeBA,
    })),
  };
}

function newRoutePoolKey(tokenA: string, tokenB: string, poolType: number) {
  return tokenA.toLowerCase() < tokenB.toLowerCase()
    ? `${tokenA}:${tokenB}:${poolType}`
    : `${tokenB}:${tokenA}:${poolType}`;
}

function getPathsWith1Hop(poolsA: RoutePool[], poolsB: RoutePool[], tokenIn: string, baseToken: string) {
  const paths: Path[] = [];
  for (const poolA of poolsA) {
    for (const poolB of poolsB) {
      if (poolA && poolB) {
        paths.push(
          createPath([
            { routePool: poolA, tokenIn },
            { routePool: poolB, tokenIn: baseToken },
          ])
        );
      }
    }
  }

  return paths;
}

function getPathsWith2Hops(
  poolsA: RoutePool[],
  poolsBase: RoutePool[],
  poolsB: RoutePool[],
  tokenIn: string,
  baseToken1: string,
  baseToken2: string
) {
  const paths: Path[] = [];
  for (const poolA of poolsA) {
    for (const poolBase of poolsBase) {
      for (const poolB of poolsB) {
        if (poolA && poolBase && poolB) {
          paths.push(
            createPath([
              { routePool: poolA, tokenIn },
              { routePool: poolBase, tokenIn: baseToken1 },
              { routePool: poolB, tokenIn: baseToken2 },
            ])
          );
        }
      }
    }
  }

  return paths;
}

export function findAllPossiblePaths(tokenIn: string, tokenOut: string, routePools: RoutePools, baseTokens: string[]) {
  const { poolsDirect, poolsA, poolsB, poolsBase } = routePools;

  const paths: Path[] = [];

  // Direct pools
  for (const routePool of poolsDirect) {
    if (hasLiquidity(routePool, tokenIn)) {
      const path = createPath([{ routePool, tokenIn }]);
      paths.push(path);
    }
  }

  const routePoolMap: Map<string, RoutePool> = new Map();
  for (const routePool of [...poolsA, ...poolsB, ...poolsBase]) {
    if (hasLiquidity(routePool)) {
      routePoolMap.set(newRoutePoolKey(routePool.tokenA, routePool.tokenB, routePool.poolType), routePool);
    }
  }

  // 1 hop
  for (const baseToken of baseTokens) {
    if (baseToken === tokenIn || baseToken === tokenOut) continue;

    const poolA1 = routePoolMap.get(newRoutePoolKey(tokenIn, baseToken, 1));
    const poolA2 = routePoolMap.get(newRoutePoolKey(tokenIn, baseToken, 2));

    const poolB1 = routePoolMap.get(newRoutePoolKey(baseToken, tokenOut, 1));
    const poolB2 = routePoolMap.get(newRoutePoolKey(baseToken, tokenOut, 2));

    paths.push(
      ...getPathsWith1Hop(
        [poolA1, poolA2].filter(Boolean) as RoutePool[],
        [poolB1, poolB2].filter(Boolean) as RoutePool[],
        tokenIn,
        baseToken
      )
    );
  }

  // 2 hops
  for (const baseToken1 of baseTokens) {
    if (baseToken1 === tokenIn || baseToken1 === tokenOut) continue;
    const poolA1 = routePoolMap.get(newRoutePoolKey(tokenIn, baseToken1, 1));
    const poolA2 = routePoolMap.get(newRoutePoolKey(tokenIn, baseToken1, 2));

    for (const baseToken2 of baseTokens) {
      if (baseToken2 === tokenIn || baseToken2 === tokenOut || baseToken2 === baseToken1) continue;

      const poolBase1 = routePoolMap.get(newRoutePoolKey(baseToken1, baseToken2, 1));
      const poolBase2 = routePoolMap.get(newRoutePoolKey(baseToken1, baseToken2, 2));

      const poolB1 = routePoolMap.get(newRoutePoolKey(baseToken2, tokenOut, 1));
      const poolB2 = routePoolMap.get(newRoutePoolKey(baseToken2, tokenOut, 2));

      paths.push(
        ...getPathsWith2Hops(
          [poolA1, poolA2].filter(Boolean) as RoutePool[],
          [poolBase1, poolBase2].filter(Boolean) as RoutePool[],
          [poolB1, poolB2].filter(Boolean) as RoutePool[],
          tokenIn,
          baseToken1,
          baseToken2
        )
      );
    }
  }

  return paths;
}

const granularity = 10; // div to 10 parts

async function splitAmount(amount: BigNumber, parts: number): Promise<BigNumber[][]> {
  if (parts == 0) {
    return [];
  }

  if (parts == 1) {
    return [[amount]];
  }

  if (parts === 2) {
    return fixSplitAmounts(amount, splitAmounts2(amount, granularity));
  }

  if (parts === 3) {
    return fixSplitAmounts(amount, splitAmounts3(amount, granularity));
  }

  if (parts === 4) {
    return fixSplitAmounts(amount, splitAmounts4(amount, granularity));
  }

  if (parts === 5) {
    return fixSplitAmounts(amount, splitAmounts5(amount, granularity));
  }

  throw Error('Unsupported split parts');
}

function splitAmounts2(amount: BigNumber, granularity: number): BigNumber[][] {
  const oneSplit = amount.div(granularity);
  if (oneSplit.isZero()) {
    return [];
  }

  const amounts: BigNumber[][] = [];

  for (let i = 0; i <= granularity; i++) {
    const a = oneSplit.mul(i);
    const b = oneSplit.mul(granularity - i);

    amounts.push([a, b]);
  }

  return amounts;
}

function splitAmounts3(amount: BigNumber, granularity: number): BigNumber[][] {
  const oneSplit = amount.div(granularity);
  if (oneSplit.isZero()) {
    return [];
  }

  const amounts: BigNumber[][] = [];

  for (let i = 0; i <= granularity; i++) {
    const a = oneSplit.mul(i);

    const remaining = granularity - i;
    for (let j = 0; j <= remaining; j++) {
      const b = oneSplit.mul(j);
      const c = oneSplit.mul(remaining - j);

      amounts.push([a, b, c]);
    }
  }

  return amounts;
}

function splitAmounts4(amount: BigNumber, granularity: number): BigNumber[][] {
  const oneSplit = amount.div(granularity);
  if (oneSplit.isZero()) {
    return [];
  }

  const amounts: BigNumber[][] = [];

  for (let i = 0; i <= granularity; i++) {
    const a = oneSplit.mul(i);

    const remaining = granularity - i;
    for (let j = 0; j <= remaining; j++) {
      const b = oneSplit.mul(j);

      const remaining2 = remaining - j;
      for (let k = 0; k <= remaining2; k++) {
        const c = oneSplit.mul(k);
        const d = oneSplit.mul(remaining2 - k);

        amounts.push([a, b, c, d]);
      }
    }
  }

  return amounts;
}

function splitAmounts5(amount: BigNumber, granularity: number): BigNumber[][] {
  const oneSplit = amount.div(granularity);
  if (oneSplit.isZero()) {
    return [];
  }

  const amounts: BigNumber[][] = [];

  for (let i = 0; i <= granularity; i++) {
    const a = oneSplit.mul(i);

    const remaining = granularity - i;
    for (let j = 0; j <= remaining; j++) {
      const b = oneSplit.mul(j);

      const remaining2 = remaining - j;
      for (let k = 0; k <= remaining2; k++) {
        const c = oneSplit.mul(k);

        const remaining3 = remaining2 - k;
        for (let l = 0; l <= remaining3; l++) {
          const d = oneSplit.mul(l);
          const e = oneSplit.mul(remaining3 - l);

          amounts.push([a, b, c, d, e]);
        }
      }
    }
  }

  return amounts;
}

function fixSplitAmounts(amount: BigNumber, amounts: BigNumber[][]): BigNumber[][] {
  for (const group of amounts) {
    let sum: BigNumber = ZERO;

    for (const amount of group) {
      sum = sum.add(amount);
    }

    if (!sum.eq(amount)) {
      const diff: BigNumber = amount.sub(sum);

      for (const amount of group) {
        // only add diff to non-zero amount
        if (!amount.isZero()) {
          group[0] = group[0].add(diff);
          break;
        }
      }
    }
  }

  return amounts;
}

function computeDFromAdjustedBalances(A: BigNumber, xp0: BigNumber, xp1: BigNumber, checkOverflow: boolean): BigNumber {
  const s = xp0.add(xp1);

  if (s.isZero()) {
    return ZERO;
  } else {
    let prevD;
    let d = s;
    const nA = A.mul(TWO);

    for (let i = 0; i < MAX_LOOP_LIMIT; i++) {
      const dSq = d.mul(d);

      if (checkOverflow && dSq.gt(UINT256_MAX)) {
        throw Error('overflow');
      }

      const d2 = dSq.div(xp0).mul(d);
      if (checkOverflow && d2.gt(UINT256_MAX)) {
        throw Error('overflow');
      }

      const dP = d2.div(xp1).div(FOUR);
      prevD = d;

      const d0 = nA.mul(s).add(dP.mul(TWO)).mul(d);
      if (checkOverflow && d0.gt(UINT256_MAX)) {
        throw Error('overflow');
      }

      d = d0.div(nA.sub(ONE).mul(d).add(dP.mul(THREE)));

      if (d.sub(prevD).abs().lte(ONE)) {
        return d;
      }
    }

    return d;
  }
}

function getY(A: BigNumber, x: BigNumber, d: BigNumber): BigNumber {
  const nA = A.mul(TWO);

  const c = d.mul(d).div(x.mul(TWO)).mul(d).div(nA.mul(TWO));

  const b = d.div(nA).add(x);

  let yPrev;
  let y = d;

  for (let i = 0; i < MAX_LOOP_LIMIT; i++) {
    yPrev = y;
    y = y.mul(y).add(c).div(y.mul(TWO).add(b).sub(d));

    if (y.sub(yPrev).abs().lte(ONE)) {
      break;
    }
  }

  return y;
}

function getAmountOutStable(params: GetAmountParams, checkOverflow: boolean): BigNumber {
  const adjustedReserveIn = params.reserveIn.mul(params.tokenInPrecisionMultiplier!);
  if (checkOverflow && adjustedReserveIn.gt(MAX_XP)) {
    throw Error('overflow');
  }
  const adjustedReserveOut = params.reserveOut.mul(params.tokenOutPrecisionMultiplier!);
  if (checkOverflow && adjustedReserveOut.gt(MAX_XP)) {
    throw Error('overflow');
  }

  const amountIn = params.amount;
  const feeDeductedAmountIn = amountIn.sub(amountIn.mul(params.swapFee).div(MAX_FEE));
  const d = computeDFromAdjustedBalances(STABLE_POOL_A, adjustedReserveIn, adjustedReserveOut, checkOverflow);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const x = adjustedReserveIn.add(feeDeductedAmountIn.mul(params.tokenInPrecisionMultiplier!));
  const y = getY(STABLE_POOL_A, x, d);
  const dy = adjustedReserveOut.sub(y).sub(1);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const amountOut = dy.div(params.tokenOutPrecisionMultiplier!);

  return amountOut;
}

function getAmountOutClassic(params: GetAmountParams, checkOverflow: boolean): BigNumber {
  const amountIn = params.amount;
  const reserveIn = params.reserveIn;
  if (checkOverflow && reserveIn.add(amountIn).gt(UINT128_MAX)) {
    throw Error('overflow');
  }

  const amountInWithFee = amountIn.mul(MAX_FEE.sub(params.swapFee));
  if (checkOverflow && amountInWithFee.gt(UINT256_MAX)) {
    throw Error('overflow');
  }

  const numerator = amountInWithFee.mul(params.reserveOut);
  if (checkOverflow && numerator.gt(UINT256_MAX)) {
    throw Error('overflow');
  }

  const denominator = params.reserveIn.mul(MAX_FEE).add(amountInWithFee);
  if (checkOverflow && denominator.gt(UINT256_MAX)) {
    throw Error('overflow');
  }

  return numerator.div(denominator);
}

function calculateAmountOut(params: GetAmountParams, checkOverflow: boolean): BigNumber {
  if (params.amount.isZero()) {
    return ZERO;
  }

  let amountOut;
  try {
    if (params.stable) {
      amountOut = getAmountOutStable(params, checkOverflow);
    } else {
      amountOut = getAmountOutClassic(params, checkOverflow);
    }
  } catch (error: any) {
    if (error.message === 'overflow') {
    }
    return ZERO;
  }

  return amountOut;
}

function calculateAmountOutForStep(chainId: number, step: Step, amountIn: BigNumber): [BigNumber, Step | null] {
  const isTokenAIn = step.routePool.tokenA === step.tokenIn;
  const [reserveIn, reserveOut] = isTokenAIn
    ? [step.routePool.reserveA, step.routePool.reserveB]
    : [step.routePool.reserveB, step.routePool.reserveA];

  let tokenInPrecisionMultiplier: BigNumber;
  let tokenOutPrecisionMultiplier: BigNumber;

  // create multiplier for stable pools
  const stable = step.routePool.poolType === 2;
  if (stable) {
    const [tokenInAddress, tokenOutAddress] = isTokenAIn
      ? [step.routePool.tokenA, step.routePool.tokenB]
      : [step.routePool.tokenB, step.routePool.tokenA];

    const tokenIn = getToken(chainId, tokenInAddress);
    const tokenOut = getToken(chainId, tokenOutAddress);
    if (!tokenIn || !tokenOut) {
      throw Error('Unknown token found');
    }

    tokenInPrecisionMultiplier = BigNumber.from(10).pow(18 - tokenIn.decimals);
    tokenOutPrecisionMultiplier = BigNumber.from(10).pow(18 - tokenOut.decimals);
  } else {
    tokenInPrecisionMultiplier = ZERO;
    tokenOutPrecisionMultiplier = ZERO;
  }

  const swapFee = BigNumber.from(step.swapFee); // wrap
  const amountOut = calculateAmountOut(
    {
      stable: stable,
      amount: amountIn,
      reserveIn: reserveIn,
      reserveOut: reserveOut,
      swapFee: swapFee,
      tokenInPrecisionMultiplier: tokenInPrecisionMultiplier,
      tokenOutPrecisionMultiplier: tokenOutPrecisionMultiplier,
    },
    true
  );

  let updatedStep: Step | null = null;
  if (!amountOut.isZero()) {
    // update reserves
    updatedStep = { ...step };
    if (isTokenAIn) {
      updatedStep.routePool.reserveA = step.routePool.reserveA.add(amountIn);
      updatedStep.routePool.reserveB = step.routePool.reserveB.sub(amountOut);
    } else {
      updatedStep.routePool.reserveB = step.routePool.reserveB.add(amountIn);
      updatedStep.routePool.reserveA = step.routePool.reserveA.sub(amountOut);
    }
  }

  return [amountOut, updatedStep];
}

function calculatePathAmountsByInput(chainId: number, path: Path, amountIn: BigNumber) {
  const stepsWithAmount: StepWithAmount[] = [];
  let amountInNext = amountIn;

  // calculate amount for each step
  for (let i = 0; i < path.steps.length; i++) {
    const step = path.steps[i];

    const [stepAmountOut, updatedStep] = calculateAmountOutForStep(chainId, step, amountInNext);
    if (stepAmountOut.isZero()) {
      return null;
    } else {
      // record amount
      stepsWithAmount.push({
        ...step,
        updatedStep: updatedStep,
        amountIn: amountInNext,
      });

      amountInNext = stepAmountOut; // use step output as input of next step
    }
  }

  const pathAmountOut = amountInNext; // amount out of the end step

  const amounts: PathWithAmounts = {
    stepsWithAmount: stepsWithAmount,
    amountOut: pathAmountOut,
    amountIn: amountIn,
  };

  return amounts;
}

async function calculateGroupAmounts(
  chainId: number,
  paths: Path[],
  amounts: BigNumber[] // amounts must match the length of paths
): Promise<GroupAmounts | null> {
  const pathsWithAmounts: PathWithAmounts[] = [];
  let amountOut = ZERO;

  const lastSteps: Map<string, Step> = new Map();

  // for each path
  for (let i = 0; i < paths.length; i++) {
    const pathAmountIn = amounts[i];
    if (pathAmountIn.isZero()) {
      continue;
    }

    const path = paths[i];

    // update steps to last states if possible
    for (let j = 0; j < path.steps.length; j++) {
      const lastStep = lastSteps.get(path.steps[j].routePool.pool);
      if (lastStep) {
        path.steps[j] = { ...lastStep };
      }
    }

    const pathWithAmounts = calculatePathAmountsByInput(chainId, path, pathAmountIn);
    // path will be removed from group if failed
    if (pathWithAmounts != null) {
      // set as last step with updated reserves
      for (const step of pathWithAmounts.stepsWithAmount) {
        if (step.updatedStep !== null) {
          lastSteps.set(step.routePool.pool, step.updatedStep);
        }
      }

      pathsWithAmounts.push(pathWithAmounts);
      amountOut = amountOut.add(pathWithAmounts.amountOut);
    }
  }

  return { pathsWithAmounts, amountOut };
}

export async function findBestAmountsForPathsExactIn(
  chainId: number,
  paths: Path[],
  amountIn: BigNumber
): Promise<BestPathsWithAmounts> {
  const pathAmounts: BigNumber[][] = await splitAmount(amountIn, paths.length);

  const groups: GroupAmounts[] = [];
  const groupPromises: Promise<boolean>[] = [];
  // for each amount group
  for (const amounts of pathAmounts) {
    const promise = new Promise<boolean>((resolve, reject) => {
      calculateGroupAmounts(chainId, paths, amounts).then((group) => {
        if (group === null) {
          reject('expired');
        } else {
          groups.push(group);
          resolve(true);
        }
      });
    });
    groupPromises.push(promise);
  }

  // settle all groups
  await Promise.all(groupPromises);

  let bestPathsWithAmounts: PathWithAmounts[] = [];
  let bestAmountOut = ZERO;
  // compare groups for the best
  for (const group of groups) {
    if (group.amountOut.gt(bestAmountOut)) {
      // set as best if has more output
      bestPathsWithAmounts = group.pathsWithAmounts;
      bestAmountOut = group.amountOut;
    }
  }

  const swapPaths: SwapPath[] = bestPathsWithAmounts.map(({ stepsWithAmount, amountIn }) => ({
    steps: stepsWithAmount.map((step) => ({ pool: step.routePool.pool, tokenIn: step.tokenIn })),
    tokenIn: stepsWithAmount[0].tokenIn,
    amountIn: amountIn.toString(),
  }));

  return { amountOut: bestAmountOut, paths: swapPaths };
}

// https://syncswap.gitbook.io/api-documentation/guides/request-swap-with-router
export function toSwapPaths(paths: SwapPath[], to: string): IRouter.SwapPathStruct[] {
  return paths.map(({ steps, tokenIn, amountIn }) => ({
    steps: steps.map((step, i) => {
      const isLastStep = i === steps.length - 1;
      const stepTo = isLastStep ? to : steps[i + 1].pool;
      const withdrawMode = isLastStep ? 2 : 0;
      return {
        pool: step.pool,
        data: utils.defaultAbiCoder.encode(['address', 'address', 'uint8'], [step.tokenIn, stepTo, withdrawMode]),
        callback: constants.AddressZero,
        callbackData: '0x',
      };
    }),
    tokenIn,
    amountIn,
  }));
}

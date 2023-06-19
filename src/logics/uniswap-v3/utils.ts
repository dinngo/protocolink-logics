import {
  ADDITIONAL_BASES,
  BASES_TO_CHECK_TRADES_AGAINST,
  CUSTOM_BASES,
  DEFAULT_DEADLINE_FROM_NOW,
  L2_DEADLINE_FROM_NOW,
} from './constants';
import { Currency, Token } from '@uniswap/sdk-core';
import { FeeAmount, Pool, Route } from '@uniswap/v3-sdk';
import * as common from '@furucombo/composable-router-common';

// https://github.com/Uniswap/interface/blob/v4.204.5/src/hooks/useAllCurrencyCombinations.ts#L6
export function getAllCurrencyCombinations(chainId: number, currencyA: Currency, currencyB: Currency) {
  const [tokenA, tokenB] = [currencyA.wrapped, currencyB.wrapped];

  const common = BASES_TO_CHECK_TRADES_AGAINST[chainId] ?? [];
  const additionalA = tokenA ? ADDITIONAL_BASES[chainId]?.[tokenA.address] ?? [] : [];
  const additionalB = tokenB ? ADDITIONAL_BASES[chainId]?.[tokenB.address] ?? [] : [];
  const bases = [...common, ...additionalA, ...additionalB];
  const basePairs = bases
    .flatMap((base): [Token, Token][] => bases.map((otherBase) => [base, otherBase]))
    .filter(([t0, t1]) => !t0.equals(t1));

  const allCurrencyCombinations = [
    // the direct pair
    [tokenA, tokenB] as [Token, Token],
    // token A against all bases
    ...bases.map((base): [Token, Token] => [tokenA, base]),
    // token B against all bases
    ...bases.map((base): [Token, Token] => [tokenB, base]),
    // each base against all bases
    ...basePairs,
  ]
    .filter(([t0, t1]) => !t0.equals(t1))
    // filter out duplicate pairs
    .filter(([t0, t1], i, otherPairs) => {
      // find the first index in the array at which there are the same 2 tokens as the current
      const firstIndexInOtherPairs = otherPairs.findIndex(([t0Other, t1Other]) => {
        return (t0.equals(t0Other) && t1.equals(t1Other)) || (t0.equals(t1Other) && t1.equals(t0Other));
      });
      // only accept the first occurrence of the same 2 tokens
      return firstIndexInOtherPairs === i;
    }) // optionally filter out some pairs for tokens with custom bases defined
    .filter(([tokenA, tokenB]) => {
      if (!chainId) return true;
      const customBases = CUSTOM_BASES[chainId];

      const customBasesA: Token[] | undefined = customBases?.[tokenA.address];
      const customBasesB: Token[] | undefined = customBases?.[tokenB.address];

      if (!customBasesA && !customBasesB) return true;

      if (customBasesA && !customBasesA.find((base) => tokenB.equals(base))) return false;
      if (customBasesB && !customBasesB.find((base) => tokenA.equals(base))) return false;

      return true;
    });

  return allCurrencyCombinations;
}

// https://github.com/Uniswap/interface/blob/v4.204.5/src/hooks/useV3SwapPools.ts#L26
export function getAllCurrencyCombinationsWithAllFees(chainId: number, currencyIn: Currency, currencyOut: Currency) {
  const allCurrencyCombinations = getAllCurrencyCombinations(chainId, currencyIn, currencyOut);
  const allCurrencyCombinationsWithAllFees = allCurrencyCombinations.reduce<[Token, Token, FeeAmount][]>(
    (list, [tokenA, tokenB]) => {
      return chainId === common.ChainId.mainnet
        ? list.concat([
            [tokenA, tokenB, FeeAmount.LOW],
            [tokenA, tokenB, FeeAmount.MEDIUM],
            [tokenA, tokenB, FeeAmount.HIGH],
          ])
        : list.concat([
            [tokenA, tokenB, FeeAmount.LOWEST],
            [tokenA, tokenB, FeeAmount.LOW],
            [tokenA, tokenB, FeeAmount.MEDIUM],
            [tokenA, tokenB, FeeAmount.HIGH],
          ]);
    },
    []
  );

  return allCurrencyCombinationsWithAllFees;
}

// https://github.com/Uniswap/interface/blob/v4.204.5/src/hooks/useAllV3Routes.ts#L13
function poolEquals(poolA: Pool, poolB: Pool) {
  return (
    poolA === poolB ||
    (poolA.token0.equals(poolB.token0) && poolA.token1.equals(poolB.token1) && poolA.fee === poolB.fee)
  );
}

// https://github.com/Uniswap/interface/blob/v4.204.5/src/hooks/useAllV3Routes.ts#L20
export function computeAllRoutes(
  currencyIn: Currency,
  currencyOut: Currency,
  pools: Pool[],
  chainId: number,
  currentPath: Pool[] = [],
  allPaths: Route<Currency, Currency>[] = [],
  startCurrencyIn: Currency = currencyIn,
  maxHops = 2
) {
  const tokenIn = currencyIn.wrapped;
  const tokenOut = currencyOut.wrapped;
  for (const pool of pools) {
    if (!pool.involvesToken(tokenIn) || currentPath.find((pathPool) => poolEquals(pool, pathPool))) continue;

    const outputToken = pool.token0.equals(tokenIn) ? pool.token1 : pool.token0;
    if (outputToken.equals(tokenOut)) {
      allPaths.push(new Route([...currentPath, pool], startCurrencyIn, currencyOut));
    } else if (maxHops > 1) {
      computeAllRoutes(
        outputToken,
        currencyOut,
        pools,
        chainId,
        [...currentPath, pool],
        allPaths,
        startCurrencyIn,
        maxHops - 1
      );
    }
  }

  return allPaths;
}

export function getDeadline(chainId: number) {
  const fromNow = chainId === common.ChainId.mainnet ? DEFAULT_DEADLINE_FROM_NOW : L2_DEADLINE_FROM_NOW;
  return Math.floor(Date.now() / 1000) + fromNow;
}

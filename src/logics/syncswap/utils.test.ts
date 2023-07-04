import { BigNumber } from 'ethers';
import { IRouter } from './contracts/Router';
import { RoutePools, SwapPath } from './types';
import * as common from '@protocolink/common';
import { expect } from 'chai';
import { findAllPossiblePaths, findBestAmountsForPathsExactIn, toSwapPaths } from './utils';
import { getConfig } from './configs';
import { zksyncTokens } from './tokens';

describe('SyncSwap utils functions', function () {
  const chainId = common.ChainId.zksync;
  const config = getConfig(chainId);
  const account = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';

  const testCases: {
    input: common.TokenAmount;
    tokenOut: common.Token;
    routePools: RoutePools;
    expected: {
      amountOut: BigNumber;
      paths: SwapPath[];
      swapPaths: IRouter.SwapPathStruct[];
    };
  }[] = [
    {
      input: new common.TokenAmount(zksyncTokens.ETH, '1'),
      tokenOut: zksyncTokens.USDC,
      routePools: {
        poolsDirect: [
          {
            pool: '0x80115c708E12eDd42E504c1cD52Aea96C547c05c',
            tokenA: '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91',
            tokenB: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4',
            poolType: 1,
            reserveA: BigNumber.from('0x0341d1eefa02610d2cea'),
            reserveB: BigNumber.from('0x1b52988a45f7'),
            swapFeeAB: 300,
            swapFeeBA: 300,
          },
        ],
        poolsA: [],
        poolsB: [],
        poolsBase: [
          {
            pool: '0x80115c708E12eDd42E504c1cD52Aea96C547c05c',
            tokenA: '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91',
            tokenB: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4',
            poolType: 1,
            reserveA: BigNumber.from('0x0341d1eefa02610d2cea'),
            reserveB: BigNumber.from('0x1b52988a45f7'),
            swapFeeAB: 300,
            swapFeeBA: 300,
          },
        ],
      },
      expected: {
        amountOut: BigNumber.from('1947141165'),
        paths: [
          {
            steps: [
              {
                pool: '0x80115c708E12eDd42E504c1cD52Aea96C547c05c',
                tokenIn: '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91',
              },
            ],
            tokenIn: '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91',
            amountIn: '1000000000000000000',
          },
        ],
        swapPaths: [
          {
            steps: [
              {
                pool: '0x80115c708E12eDd42E504c1cD52Aea96C547c05c',
                data: '0x0000000000000000000000005aea5775959fbc2557cc8789bc1bf90a239d9a91000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa0000000000000000000000000000000000000000000000000000000000000002',
                callback: '0x0000000000000000000000000000000000000000',
                callbackData: '0x',
              },
            ],
            tokenIn: '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91',
            amountIn: '1000000000000000000',
          },
        ],
      },
    },
    {
      input: new common.TokenAmount(zksyncTokens.USDC, '1'),
      tokenOut: zksyncTokens.ETH,
      routePools: {
        poolsDirect: [
          {
            pool: '0x80115c708E12eDd42E504c1cD52Aea96C547c05c',
            tokenA: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4',
            tokenB: '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91',
            poolType: 1,
            reserveA: BigNumber.from('0x1b524364a17d'),
            reserveB: BigNumber.from('0x0341bccfcf48597badf7'),
            swapFeeAB: 300,
            swapFeeBA: 300,
          },
        ],
        poolsA: [],
        poolsB: [],
        poolsBase: [
          {
            pool: '0x80115c708E12eDd42E504c1cD52Aea96C547c05c',
            tokenA: '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91',
            tokenB: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4',
            poolType: 1,
            reserveA: BigNumber.from('0x0341bccfcf48597badf7'),
            reserveB: BigNumber.from('0x1b524364a17d'),
            swapFeeAB: 300,
            swapFeeBA: 300,
          },
        ],
      },
      expected: {
        amountOut: BigNumber.from('510437285306966'),
        paths: [
          {
            steps: [
              {
                pool: '0x80115c708E12eDd42E504c1cD52Aea96C547c05c',
                tokenIn: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4',
              },
            ],
            tokenIn: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4',
            amountIn: '1000000',
          },
        ],
        swapPaths: [
          {
            steps: [
              {
                pool: '0x80115c708E12eDd42E504c1cD52Aea96C547c05c',
                data: '0x0000000000000000000000003355df6d4c9c3035724fd0e3914de96a5a83aaf4000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa0000000000000000000000000000000000000000000000000000000000000002',
                callback: '0x0000000000000000000000000000000000000000',
                callbackData: '0x',
              },
            ],
            tokenIn: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4',
            amountIn: '1000000',
          },
        ],
      },
    },
    {
      input: new common.TokenAmount(zksyncTokens.USDC, '1'),
      tokenOut: zksyncTokens.WBTC,
      routePools: {
        poolsDirect: [
          {
            pool: '0xAE931C65E7cC843BB46AE63CC9DE54adbF2E647D',
            tokenA: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4',
            tokenB: '0xBBeB516fb02a01611cBBE0453Fe3c580D7281011',
            poolType: 1,
            reserveA: BigNumber.from('0x2c528a64'),
            reserveB: BigNumber.from('0x243d91'),
            swapFeeAB: 200,
            swapFeeBA: 200,
          },
        ],
        poolsA: [
          {
            pool: '0x80115c708E12eDd42E504c1cD52Aea96C547c05c',
            tokenA: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4',
            tokenB: '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91',
            poolType: 1,
            reserveA: BigNumber.from('0x1b522be49694'),
            reserveB: BigNumber.from('0x0341d5e31999d64d2572'),
            swapFeeAB: 300,
            swapFeeBA: 300,
          },
        ],
        poolsB: [
          {
            pool: '0xb3479139e07568BA954C8a14D5a8B3466e35533d',
            tokenA: '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91',
            tokenB: '0xBBeB516fb02a01611cBBE0453Fe3c580D7281011',
            poolType: 1,
            reserveA: BigNumber.from('0x169f5b5a2618561df1'),
            reserveB: BigNumber.from('0x9b8feb66'),
            swapFeeAB: 300,
            swapFeeBA: 250,
          },
        ],
        poolsBase: [
          {
            pool: '0x80115c708E12eDd42E504c1cD52Aea96C547c05c',
            tokenA: '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91',
            tokenB: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4',
            poolType: 1,
            reserveA: BigNumber.from('0x0341d5e31999d64d2572'),
            reserveB: BigNumber.from('0x1b522be49694'),
            swapFeeAB: 300,
            swapFeeBA: 300,
          },
        ],
      },
      expected: {
        amountOut: BigNumber.from('3183'),
        paths: [
          {
            steps: [
              {
                pool: '0x80115c708E12eDd42E504c1cD52Aea96C547c05c',
                tokenIn: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4',
              },
              {
                pool: '0xb3479139e07568BA954C8a14D5a8B3466e35533d',
                tokenIn: '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91',
              },
            ],
            tokenIn: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4',
            amountIn: '1000000',
          },
        ],
        swapPaths: [
          {
            steps: [
              {
                pool: '0x80115c708E12eDd42E504c1cD52Aea96C547c05c',
                data: '0x0000000000000000000000003355df6d4c9c3035724fd0e3914de96a5a83aaf4000000000000000000000000b3479139e07568ba954c8a14d5a8b3466e35533d0000000000000000000000000000000000000000000000000000000000000000',
                callback: '0x0000000000000000000000000000000000000000',
                callbackData: '0x',
              },
              {
                pool: '0xb3479139e07568BA954C8a14D5a8B3466e35533d',
                data: '0x0000000000000000000000005aea5775959fbc2557cc8789bc1bf90a239d9a91000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa0000000000000000000000000000000000000000000000000000000000000002',
                callback: '0x0000000000000000000000000000000000000000',
                callbackData: '0x',
              },
            ],
            tokenIn: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4',
            amountIn: '1000000',
          },
        ],
      },
    },
  ];

  testCases.forEach(({ input, tokenOut, routePools, expected }, i) => {
    it(`case ${i + 1}`, async function () {
      const paths = findAllPossiblePaths(
        input.token.wrapped.address,
        tokenOut.wrapped.address,
        routePools,
        config.baseTokenAddresses
      );
      const bestAmounts = await findBestAmountsForPathsExactIn(this.chainId, paths, input.amountWei);
      expect(bestAmounts.amountOut).to.eq(expected.amountOut);
      expect(bestAmounts.paths).to.deep.eq(expected.paths);
      expect(toSwapPaths(bestAmounts.paths, account)).to.deep.eq(expected.swapPaths);
    });
  });
});

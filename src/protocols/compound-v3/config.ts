/* eslint-disable max-len */

import * as common from '@composable-router/common';

type ContractNames = 'CometRewards';

export const contractAddressMap: Record<number, { [k in ContractNames]: string }> = {
  [common.ChainId.mainnet]: {
    CometRewards: '0x1B0e765F6224C21223AeA2af16c1C46E38885a40',
  },
  [common.ChainId.polygon]: {
    CometRewards: '0x45939657d1CA34A8FA39A924B71D28Fe8431e581',
  },
};

export function getContractAddress(chainId: number, name: ContractNames) {
  return contractAddressMap[chainId][name];
}

export enum MarketId {
  USDC = 'USDC',
  ETH = 'ETH',
}

export interface MarketConfig {
  id: string;
  cometAddress: string;
  baseTokenAddress: string;
}

export const marketsMap: Record<number, MarketConfig[]> = {
  [common.ChainId.mainnet]: [
    {
      id: MarketId.USDC,
      cometAddress: '0xc3d688B66703497DAA19211EEdff47f25384cdc3',
      baseTokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    },
    {
      id: MarketId.ETH,
      cometAddress: '0xA17581A9E3356d9A858b789D68B4d866e593aE94',
      baseTokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    },
  ],
  [common.ChainId.polygon]: [
    {
      id: MarketId.USDC,
      cometAddress: '0xF25212E676D1F7F89Cd72fFEe66158f541246445',
      baseTokenAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    },
  ],
};

export const marketMap = Object.keys(marketsMap).reduce((accumulator, key) => {
  const chainId = Number(key);
  const markets = marketsMap[chainId];

  if (!accumulator[chainId]) accumulator[chainId] = {};
  for (const market of markets) {
    accumulator[chainId][market.id] = market;
  }

  return accumulator;
}, {} as Record<number, Record<string, MarketConfig>>);

export function getMarkets(chainId: number) {
  return marketsMap[chainId];
}

export function getMarket(chainId: number, id: string) {
  return marketMap[chainId][id];
}

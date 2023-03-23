/* eslint-disable max-len */

import * as common from '@composable-router/common';
import { utils } from 'ethers';

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
  bulker: {
    address: string;
    abi: string;
    actions: {
      supplyNativeToken: string | number;
      withdrawNativeToken: string | number;
    };
  };
}

export const marketsMap: Record<number, MarketConfig[]> = {
  [common.ChainId.mainnet]: [
    {
      id: MarketId.USDC,
      cometAddress: '0xc3d688B66703497DAA19211EEdff47f25384cdc3',
      baseTokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      bulker: {
        address: '0x74a81F84268744a40FEBc48f8b812a1f188D80C3',
        abi: `[{"inputs":[{"internalType":"uint256[]","name":"actions","type":"uint256[]"},{"internalType":"bytes[]","name":"data","type":"bytes[]"}],"name":"invoke","outputs":[],"stateMutability":"payable","type":"function"}]`,
        actions: {
          supplyNativeToken: 2,
          withdrawNativeToken: 5,
        },
      },
    },
    {
      id: MarketId.ETH,
      cometAddress: '0xA17581A9E3356d9A858b789D68B4d866e593aE94',
      baseTokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      bulker: {
        address: '0xa397a8C2086C554B531c02E29f3291c9704B00c7',
        abi: `[{"inputs":[{"name":"actions","type":"bytes32[]"},{"name":"data","type":"bytes[]"}],"name":"invoke","outputs":[],"stateMutability":"payable","type":"function"}]`,
        actions: {
          supplyNativeToken: utils.formatBytes32String('ACTION_SUPPLY_NATIVE_TOKEN'),
          withdrawNativeToken: utils.formatBytes32String('ACTION_WITHDRAW_NATIVE_TOKEN'),
        },
      },
    },
  ],
  [common.ChainId.polygon]: [
    {
      id: MarketId.USDC,
      cometAddress: '0xF25212E676D1F7F89Cd72fFEe66158f541246445',
      baseTokenAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      bulker: {
        address: '0x59e242D352ae13166B4987aE5c990C232f7f7CD6',
        abi: `[{"inputs":[{"name":"actions","type":"bytes32[]"},{"name":"data","type":"bytes[]"}],"name":"invoke","outputs":[],"stateMutability":"payable","type":"function"}]`,
        actions: {
          supplyNativeToken: utils.formatBytes32String('ACTION_SUPPLY_NATIVE_TOKEN'),
          withdrawNativeToken: utils.formatBytes32String('ACTION_WITHDRAW_NATIVE_TOKEN'),
        },
      },
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

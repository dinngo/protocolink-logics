import {
  arbitrumTokens,
  avalancheTokens,
  baseTokens,
  mainnetTokens,
  metisTokens,
  optimismTokens,
  polygonTokens,
} from './tokens';
import * as common from '@protocolink/common';

type ContractNames = 'Router' | 'RouterETH' | 'FeeLibrary' | 'LayerZeroEndpoint';

export enum ChainId {
  ETHEREUM = 101,
  AVALANCHE = 106,
  POLYGON = 109,
  ARBITRUM = 110,
  OPTIMISM = 111,
  METIS = 151,
  BASE = 184,
}

export enum PoolId {
  USDC = 1,
  USDT = 2,
  DAI = 3,
  FRAX = 7,
  USDD = 11,
  ETH = 13,
  sUSD = 14,
  LUSD = 15,
  METIS = 17,
}

export interface Pool {
  id: number;
  token: common.Token;
  decimals: number;
  paths: { chainId: number; poolIds: number[] }[];
}

export interface PoolConfig extends Pool {
  chainId: number;
}

export interface Config {
  id: number;
  chainId: number;
  contract: Record<ContractNames, string>;
  pools: Pool[];
  STG?: common.Token;
}

export const configs: Config[] = [
  {
    id: ChainId.ETHEREUM,
    chainId: common.ChainId.mainnet,
    contract: {
      Router: '0x8731d54E9D02c286767d56ac03e8037C07e01e98',
      RouterETH: '0x150f94B44927F078737562f0fcF3C95c01Cc2376',
      FeeLibrary: '0x8C3085D9a554884124C998CDB7f6d7219E9C1e6F',
      LayerZeroEndpoint: '0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675',
    },
    STG: mainnetTokens.STG,
    pools: [
      {
        id: PoolId.USDC,
        token: mainnetTokens.USDC,
        decimals: 6,
        paths: [
          { chainId: common.ChainId.optimism, poolIds: [PoolId.USDC] },
          { chainId: common.ChainId.polygon, poolIds: [PoolId.USDC, PoolId.USDT] },
          { chainId: common.ChainId.base, poolIds: [PoolId.USDC] },
          { chainId: common.ChainId.arbitrum, poolIds: [PoolId.USDC, PoolId.USDT] },
          { chainId: common.ChainId.avalanche, poolIds: [PoolId.USDC, PoolId.USDT] },
        ],
      },
      {
        id: PoolId.USDT,
        token: mainnetTokens.USDT,
        decimals: 6,
        paths: [
          { chainId: common.ChainId.optimism, poolIds: [PoolId.USDC] },
          { chainId: common.ChainId.polygon, poolIds: [PoolId.USDT, PoolId.USDC] },
          { chainId: common.ChainId.base, poolIds: [PoolId.USDC] },
          { chainId: common.ChainId.arbitrum, poolIds: [PoolId.USDT, PoolId.USDC] },
          { chainId: common.ChainId.avalanche, poolIds: [PoolId.USDT, PoolId.USDC] },
        ],
      },
      {
        id: PoolId.DAI,
        token: mainnetTokens.DAI,
        decimals: 6,
        paths: [
          { chainId: common.ChainId.optimism, poolIds: [PoolId.DAI] },
          { chainId: common.ChainId.polygon, poolIds: [PoolId.DAI] },
        ],
      },
      {
        id: PoolId.FRAX,
        token: mainnetTokens.FRAX,
        decimals: 6,
        paths: [
          { chainId: common.ChainId.optimism, poolIds: [PoolId.FRAX] },
          { chainId: common.ChainId.arbitrum, poolIds: [PoolId.FRAX] },
          { chainId: common.ChainId.avalanche, poolIds: [PoolId.FRAX] },
        ],
      },
      {
        id: PoolId.ETH,
        token: mainnetTokens.ETH,
        decimals: 18,
        paths: [
          { chainId: common.ChainId.optimism, poolIds: [PoolId.ETH] },
          { chainId: common.ChainId.base, poolIds: [PoolId.ETH] },
          { chainId: common.ChainId.arbitrum, poolIds: [PoolId.ETH] },
        ],
      },
      {
        id: PoolId.sUSD,
        token: mainnetTokens.sUSD,
        decimals: 6,
        paths: [{ chainId: common.ChainId.optimism, poolIds: [PoolId.sUSD] }],
      },
      {
        id: PoolId.LUSD,
        token: mainnetTokens.LUSD,
        decimals: 6,
        paths: [
          { chainId: common.ChainId.optimism, poolIds: [PoolId.LUSD] },
          { chainId: common.ChainId.arbitrum, poolIds: [PoolId.LUSD] },
        ],
      },
      {
        id: PoolId.METIS,
        token: mainnetTokens.Metis,
        decimals: 18,
        paths: [{ chainId: common.ChainId.metis, poolIds: [PoolId.METIS] }],
      },
    ],
  },
  {
    id: ChainId.OPTIMISM,
    chainId: common.ChainId.optimism,
    contract: {
      Router: '0xB0D502E938ed5f4df2E681fE6E419ff29631d62b',
      RouterETH: '0xB49c4e680174E331CB0A7fF3Ab58afC9738d5F8b',
      FeeLibrary: '0x505eCDF2f14Cd4f1f413d04624b009A449D38D7E',
      LayerZeroEndpoint: '0x3c2269811836af69497E5F486A85D7316753cf62',
    },
    STG: optimismTokens.STG,
    pools: [
      {
        id: PoolId.USDC,
        token: optimismTokens['USDC.e'],
        decimals: 6,
        paths: [
          { chainId: common.ChainId.mainnet, poolIds: [PoolId.USDC, PoolId.USDT] },
          { chainId: common.ChainId.polygon, poolIds: [PoolId.USDC, PoolId.USDT] },
          { chainId: common.ChainId.base, poolIds: [PoolId.USDC] },
          { chainId: common.ChainId.arbitrum, poolIds: [PoolId.USDC, PoolId.USDT] },
          { chainId: common.ChainId.avalanche, poolIds: [PoolId.USDC, PoolId.USDT] },
        ],
      },
      {
        id: PoolId.DAI,
        token: optimismTokens.DAI,
        decimals: 6,
        paths: [
          { chainId: common.ChainId.mainnet, poolIds: [PoolId.DAI] },
          { chainId: common.ChainId.polygon, poolIds: [PoolId.DAI] },
        ],
      },
      {
        id: PoolId.FRAX,
        token: optimismTokens.FRAX,
        decimals: 6,
        paths: [
          { chainId: common.ChainId.mainnet, poolIds: [PoolId.FRAX] },
          { chainId: common.ChainId.arbitrum, poolIds: [PoolId.FRAX] },
          { chainId: common.ChainId.avalanche, poolIds: [PoolId.FRAX] },
        ],
      },
      {
        id: PoolId.ETH,
        token: optimismTokens.ETH,
        decimals: 18,
        paths: [
          { chainId: common.ChainId.mainnet, poolIds: [PoolId.ETH] },
          { chainId: common.ChainId.base, poolIds: [PoolId.ETH] },
          { chainId: common.ChainId.arbitrum, poolIds: [PoolId.ETH] },
        ],
      },
      {
        id: PoolId.sUSD,
        token: optimismTokens.sUSD,
        decimals: 6,
        paths: [{ chainId: common.ChainId.mainnet, poolIds: [PoolId.sUSD] }],
      },
      {
        id: PoolId.LUSD,
        token: optimismTokens.LUSD,
        decimals: 6,
        paths: [
          { chainId: common.ChainId.mainnet, poolIds: [PoolId.LUSD] },
          { chainId: common.ChainId.arbitrum, poolIds: [PoolId.LUSD] },
        ],
      },
    ],
  },
  {
    id: ChainId.POLYGON,
    chainId: common.ChainId.polygon,
    contract: {
      Router: '0x45A01E4e04F14f7A4a6702c74187c5F6222033cd',
      RouterETH: '',
      FeeLibrary: '0xb279b324Ea5648bE6402ABc727173A225383494C',
      LayerZeroEndpoint: '0x3c2269811836af69497E5F486A85D7316753cf62',
    },
    STG: polygonTokens.STG,
    pools: [
      {
        id: PoolId.USDC,
        token: polygonTokens['USDC.e'],
        decimals: 6,
        paths: [
          { chainId: common.ChainId.mainnet, poolIds: [PoolId.USDC, PoolId.USDT] },
          { chainId: common.ChainId.optimism, poolIds: [PoolId.USDC] },
          { chainId: common.ChainId.base, poolIds: [PoolId.USDC] },
          { chainId: common.ChainId.arbitrum, poolIds: [PoolId.USDC, PoolId.USDT] },
          { chainId: common.ChainId.avalanche, poolIds: [PoolId.USDC, PoolId.USDT] },
        ],
      },
      {
        id: PoolId.USDT,
        token: polygonTokens.USDT,
        decimals: 6,
        paths: [
          { chainId: common.ChainId.mainnet, poolIds: [PoolId.USDT, PoolId.USDC] },
          { chainId: common.ChainId.optimism, poolIds: [PoolId.USDC] },
          { chainId: common.ChainId.base, poolIds: [PoolId.USDC] },
          { chainId: common.ChainId.arbitrum, poolIds: [PoolId.USDT, PoolId.USDC] },
          { chainId: common.ChainId.avalanche, poolIds: [PoolId.USDT, PoolId.USDC] },
        ],
      },
      {
        id: PoolId.DAI,
        token: polygonTokens.DAI,
        decimals: 6,
        paths: [
          { chainId: common.ChainId.mainnet, poolIds: [PoolId.DAI] },
          { chainId: common.ChainId.optimism, poolIds: [PoolId.DAI] },
        ],
      },
    ],
  },
  {
    id: ChainId.METIS,
    chainId: common.ChainId.metis,
    contract: {
      Router: '0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590',
      RouterETH: '',
      FeeLibrary: '0x55bDb4164D28FBaF0898e0eF14a589ac09Ac9970',
      LayerZeroEndpoint: '0x9740FF91F1985D8d2B71494aE1A2f723bb3Ed9E4',
    },
    pools: [
      {
        id: PoolId.METIS,
        token: metisTokens['METIS(ERC20)'],
        decimals: 18,
        paths: [{ chainId: common.ChainId.mainnet, poolIds: [PoolId.METIS] }],
      },
    ],
  },
  {
    id: ChainId.BASE,
    chainId: common.ChainId.base,
    contract: {
      Router: '0x45f1A95A4D3f3836523F5c83673c797f4d4d263B',
      RouterETH: '0x50B6EbC2103BFEc165949CC946d739d5650d7ae4',
      FeeLibrary: '0x9d1b1669c73b033dfe47ae5a0164ab96df25b944',
      LayerZeroEndpoint: '0xb6319cC6c8c27A8F5dAF0dD3DF91EA35C4720dd7',
    },
    STG: baseTokens.STG,
    pools: [
      {
        id: PoolId.USDC,
        token: baseTokens.USDbC,
        decimals: 6,
        paths: [
          { chainId: common.ChainId.mainnet, poolIds: [PoolId.USDC, PoolId.USDT] },
          { chainId: common.ChainId.optimism, poolIds: [PoolId.USDC] },
          { chainId: common.ChainId.polygon, poolIds: [PoolId.USDC] },
          { chainId: common.ChainId.arbitrum, poolIds: [PoolId.USDC] },
          { chainId: common.ChainId.avalanche, poolIds: [PoolId.USDC, PoolId.USDT] },
        ],
      },
      {
        id: PoolId.ETH,
        token: baseTokens.ETH,
        decimals: 18,
        paths: [
          { chainId: common.ChainId.mainnet, poolIds: [PoolId.ETH] },
          { chainId: common.ChainId.optimism, poolIds: [PoolId.ETH] },
          { chainId: common.ChainId.arbitrum, poolIds: [PoolId.ETH] },
        ],
      },
    ],
  },
  {
    id: ChainId.ARBITRUM,
    chainId: common.ChainId.arbitrum,
    contract: {
      Router: '0x53Bf833A5d6c4ddA888F69c22C88C9f356a41614',
      RouterETH: '0xbf22f0f184bCcbeA268dF387a49fF5238dD23E40',
      FeeLibrary: '0x1cF31666c06ac3401ed0C1c6346C4A9425dd7De4',
      LayerZeroEndpoint: '0x3c2269811836af69497E5F486A85D7316753cf62',
    },
    STG: arbitrumTokens.STG,
    pools: [
      {
        id: PoolId.USDC,
        token: arbitrumTokens['USDC.e'],
        decimals: 6,
        paths: [
          { chainId: common.ChainId.mainnet, poolIds: [PoolId.USDC, PoolId.USDT] },
          { chainId: common.ChainId.optimism, poolIds: [PoolId.USDC] },
          { chainId: common.ChainId.polygon, poolIds: [PoolId.USDC, PoolId.USDT] },
          { chainId: common.ChainId.base, poolIds: [PoolId.USDC] },
          { chainId: common.ChainId.avalanche, poolIds: [PoolId.USDC, PoolId.USDT] },
        ],
      },
      {
        id: PoolId.USDT,
        token: arbitrumTokens.USDT,
        decimals: 6,
        paths: [
          { chainId: common.ChainId.mainnet, poolIds: [PoolId.USDT, PoolId.USDC] },
          { chainId: common.ChainId.optimism, poolIds: [PoolId.USDC] },
          { chainId: common.ChainId.base, poolIds: [PoolId.USDC] },
          { chainId: common.ChainId.polygon, poolIds: [PoolId.USDT, PoolId.USDC] },
          { chainId: common.ChainId.avalanche, poolIds: [PoolId.USDT, PoolId.USDC] },
        ],
      },
      {
        id: PoolId.FRAX,
        token: arbitrumTokens.FRAX,
        decimals: 6,
        paths: [
          { chainId: common.ChainId.mainnet, poolIds: [PoolId.FRAX] },
          { chainId: common.ChainId.optimism, poolIds: [PoolId.FRAX] },
          { chainId: common.ChainId.avalanche, poolIds: [PoolId.FRAX] },
        ],
      },
      {
        id: PoolId.ETH,
        token: arbitrumTokens.ETH,
        decimals: 18,
        paths: [
          { chainId: common.ChainId.mainnet, poolIds: [PoolId.ETH] },
          { chainId: common.ChainId.optimism, poolIds: [PoolId.ETH] },
          { chainId: common.ChainId.base, poolIds: [PoolId.ETH] },
        ],
      },
      {
        id: PoolId.LUSD,
        token: arbitrumTokens.LUSD,
        decimals: 6,
        paths: [
          { chainId: common.ChainId.mainnet, poolIds: [PoolId.LUSD] },
          { chainId: common.ChainId.optimism, poolIds: [PoolId.LUSD] },
        ],
      },
    ],
  },
  {
    id: ChainId.AVALANCHE,
    chainId: common.ChainId.avalanche,
    contract: {
      Router: '0x45A01E4e04F14f7A4a6702c74187c5F6222033cd',
      RouterETH: '',
      FeeLibrary: '0x5E8eC15ACB5Aa94D5f0589E54441b31c5e0B992d',
      LayerZeroEndpoint: '0x3c2269811836af69497E5F486A85D7316753cf62',
    },
    STG: avalancheTokens.STG,
    pools: [
      {
        id: PoolId.USDC,
        token: avalancheTokens.USDC,
        decimals: 6,
        paths: [
          { chainId: common.ChainId.mainnet, poolIds: [PoolId.USDC, PoolId.USDT] },
          { chainId: common.ChainId.optimism, poolIds: [PoolId.USDC] },
          { chainId: common.ChainId.polygon, poolIds: [PoolId.USDC, PoolId.USDT] },
          { chainId: common.ChainId.base, poolIds: [PoolId.USDC] },
          { chainId: common.ChainId.arbitrum, poolIds: [PoolId.USDC, PoolId.USDT] },
        ],
      },
      {
        id: PoolId.USDT,
        token: avalancheTokens.USDt,
        decimals: 6,
        paths: [
          { chainId: common.ChainId.mainnet, poolIds: [PoolId.USDT, PoolId.USDC] },
          { chainId: common.ChainId.optimism, poolIds: [PoolId.USDC] },
          { chainId: common.ChainId.polygon, poolIds: [PoolId.USDT, PoolId.USDC] },
          { chainId: common.ChainId.base, poolIds: [PoolId.USDC] },
          { chainId: common.ChainId.arbitrum, poolIds: [PoolId.USDT, PoolId.USDC] },
        ],
      },
      {
        id: PoolId.FRAX,
        token: avalancheTokens.FRAX,
        decimals: 6,
        paths: [
          { chainId: common.ChainId.mainnet, poolIds: [PoolId.FRAX] },
          { chainId: common.ChainId.optimism, poolIds: [PoolId.FRAX] },
          { chainId: common.ChainId.arbitrum, poolIds: [PoolId.FRAX] },
        ],
      },
    ],
  },
];

export const [
  supportedChainIds,
  configMap,
  configMapById,
  STGTokenMap,
  tokensMap,
  poolConfigMapById,
  poolConfigsMapByToken,
] = configs.reduce(
  (accumulator, config) => {
    accumulator[0].push(config.chainId);
    accumulator[1][config.chainId] = config;
    accumulator[2][config.id] = config;
    accumulator[4][config.chainId] = new Set();
    if (config.STG) {
      accumulator[3][config.chainId] = config.STG;
      accumulator[4][config.chainId].add(config.STG);
    }
    accumulator[5][config.chainId] = {};
    accumulator[6][config.chainId] = {};
    for (const pool of config.pools) {
      accumulator[4][config.chainId].add(pool.token);
      accumulator[5][config.chainId][pool.id] = { chainId: config.chainId, ...pool };
      if (!accumulator[6][config.chainId][pool.token.address]) accumulator[6][config.chainId][pool.token.address] = [];
      accumulator[6][config.chainId][pool.token.address].push({ chainId: config.chainId, ...pool });
    }

    return accumulator;
  },
  [[], {}, {}, {}, {}, {}, {}] as [
    number[],
    Record<number, Config>,
    Record<number, Config>,
    Record<number, common.Token>,
    Record<number, Set<common.Token>>,
    Record<number, Record<number, PoolConfig>>,
    Record<number, Record<string, PoolConfig[]>>
  ]
);

export function getMarkets(chainId: number) {
  return configMap[chainId].pools;
}

export function getStargateChainId(chainId: number) {
  return configMap[chainId].id;
}

export function getChainId(stargateChainId: number) {
  return configMapById[stargateChainId].chainId;
}

export function getContractAddress(chainId: number, name: ContractNames) {
  return configMap[chainId].contract[name];
}

export function getTokens(chainId: number) {
  return [...tokensMap[chainId]];
}

export function getSTGToken(chainId: number) {
  return STGTokenMap[chainId];
}

export function isSTGToken(chainId: number, token: common.Token) {
  const STG = getSTGToken(chainId);
  return !!STG && token.is(STG);
}

export function getTokenByPoolId(chainId: number, poolId: number) {
  return poolConfigMapById[chainId][poolId].token;
}

export function getPoolDecimals(chainId: number, poolId: number) {
  return poolConfigMapById[chainId][poolId].decimals;
}

export function getDstChainIds(srcChainId: number, srcToken: common.Token) {
  const dstChainIds = new Set<number>();
  if (isSTGToken(srcChainId, srcToken)) {
    for (const config of configs) {
      if (config.chainId !== srcChainId && config.STG) {
        dstChainIds.add(config.chainId);
      }
    }
  } else {
    const srcPoolConfigs = poolConfigsMapByToken[srcChainId][srcToken.address] ?? [];
    for (const srcPoolConfig of srcPoolConfigs) {
      for (const path of srcPoolConfig.paths) {
        path.poolIds.length > 0 && dstChainIds.add(path.chainId);
      }
    }
  }

  return [...dstChainIds];
}

export function getDstTokens(srcChainId: number, srcToken: common.Token, dstChainId: number) {
  const dstTokens: common.Token[] = [];
  if (isSTGToken(srcChainId, srcToken)) {
    dstTokens.push(getSTGToken(dstChainId));
  } else {
    const srcPoolConfigs = poolConfigsMapByToken[srcChainId][srcToken.address] ?? [];
    for (const srcPoolConfig of srcPoolConfigs) {
      for (const path of srcPoolConfig.paths) {
        if (path.chainId === dstChainId) {
          for (const poolId of path.poolIds) {
            dstTokens.push(getTokenByPoolId(dstChainId, poolId));
          }
          break;
        }
      }
    }
  }

  return dstTokens;
}

export function getPoolIds(srcChainId: number, srcToken: common.Token, dstChainId: number, dstToken: common.Token) {
  const srcPoolConfigs = poolConfigsMapByToken[srcChainId][srcToken.address];
  for (const srcPoolConfig of srcPoolConfigs) {
    for (const path of srcPoolConfig.paths) {
      if (path.chainId === dstChainId) {
        for (const poolId of path.poolIds) {
          if (getTokenByPoolId(dstChainId, poolId).is(dstToken)) {
            return [srcPoolConfig.id, poolId];
          }
        }
      }
    }
  }
  throw new Error('pool id not found');
}

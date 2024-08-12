import * as common from '@protocolink/common';
import { mainnetTokens, metisTokens } from './tokens';

export enum EndpointId {
  ETHEREUM = 30101,
  BNB = 30102,
  AVALANCHE = 30106,
  ARBITRUM = 30110,
  OPTIMISM = 30111,
  POLYGON = 30109,
  METIS = 30151,
  BASE = 30184,
  IOTA = 30284,
}

export enum PoolId {
  USDC = 1,
  USDT = 2,
  ETH = 13,
  METIS = 17,
}

export interface Pool {
  id: number;
  token: common.Token;
  address: string;
  destinations: { chainId: number; endpointId: number }[];
}

export interface PoolConfig extends Pool {
  chainId: number;
}

export interface Config {
  eid: number;
  chainId: number;
  pools: Pool[];
}

export const configs: Config[] = [
  {
    eid: EndpointId.ETHEREUM,
    chainId: common.ChainId.mainnet,
    pools: [
      {
        id: PoolId.ETH,
        token: common.mainnetTokens.ETH,
        address: '0x77b2043768d28E9C9aB44E1aBfC95944bcE57931',
        destinations: [
          { chainId: common.ChainId.optimism, endpointId: EndpointId.OPTIMISM },
          { chainId: common.ChainId.metis, endpointId: EndpointId.METIS },
          { chainId: common.ChainId.base, endpointId: EndpointId.BASE },
          { chainId: common.ChainId.iota, endpointId: EndpointId.IOTA },
          { chainId: common.ChainId.arbitrum, endpointId: EndpointId.ARBITRUM },
        ],
      },
      {
        id: PoolId.USDC,
        token: common.mainnetTokens.USDC,
        address: '0xc026395860Db2d07ee33e05fE50ed7bD583189C7',
        destinations: [
          { chainId: common.ChainId.optimism, endpointId: EndpointId.OPTIMISM },
          { chainId: common.ChainId.polygon, endpointId: EndpointId.POLYGON },
          { chainId: common.ChainId.base, endpointId: EndpointId.BASE },
          { chainId: common.ChainId.iota, endpointId: EndpointId.IOTA },
          { chainId: common.ChainId.arbitrum, endpointId: EndpointId.ARBITRUM },
          { chainId: common.ChainId.avalanche, endpointId: EndpointId.AVALANCHE },
        ],
      },
      {
        id: PoolId.USDT,
        token: common.mainnetTokens.USDT,
        address: '0x933597a323Eb81cAe705C5bC29985172fd5A3973',
        destinations: [
          { chainId: common.ChainId.optimism, endpointId: EndpointId.OPTIMISM },
          { chainId: common.ChainId.bnb, endpointId: EndpointId.BNB },
          { chainId: common.ChainId.polygon, endpointId: EndpointId.POLYGON },
          { chainId: common.ChainId.metis, endpointId: EndpointId.METIS },
          { chainId: common.ChainId.iota, endpointId: EndpointId.IOTA },
          { chainId: common.ChainId.arbitrum, endpointId: EndpointId.ARBITRUM },
          { chainId: common.ChainId.avalanche, endpointId: EndpointId.AVALANCHE },
        ],
      },
      {
        id: PoolId.METIS,
        token: mainnetTokens.Metis,
        address: '0xcDafB1b2dB43f366E48e6F614b8DCCBFeeFEEcD3',
        destinations: [{ chainId: common.ChainId.metis, endpointId: EndpointId.METIS }],
      },
    ],
  },
  {
    eid: EndpointId.BNB,
    chainId: common.ChainId.bnb,
    pools: [
      {
        id: PoolId.USDT,
        token: common.bnbTokens.USDT,
        address: '0x138EB30f73BC423c6455C53df6D89CB01d9eBc63',
        destinations: [
          { chainId: common.ChainId.mainnet, endpointId: EndpointId.ETHEREUM },
          { chainId: common.ChainId.optimism, endpointId: EndpointId.OPTIMISM },
          { chainId: common.ChainId.polygon, endpointId: EndpointId.POLYGON },
          { chainId: common.ChainId.metis, endpointId: EndpointId.METIS },
          { chainId: common.ChainId.iota, endpointId: EndpointId.IOTA },
          { chainId: common.ChainId.arbitrum, endpointId: EndpointId.ARBITRUM },
          { chainId: common.ChainId.avalanche, endpointId: EndpointId.AVALANCHE },
        ],
      },
    ],
  },
  {
    eid: EndpointId.AVALANCHE,
    chainId: common.ChainId.avalanche,
    pools: [
      {
        id: PoolId.USDC,
        token: common.avalancheTokens.USDC,
        address: '0x5634c4a5FEd09819E3c46D86A965Dd9447d86e47',
        destinations: [
          { chainId: common.ChainId.mainnet, endpointId: EndpointId.ETHEREUM },
          { chainId: common.ChainId.optimism, endpointId: EndpointId.OPTIMISM },
          { chainId: common.ChainId.polygon, endpointId: EndpointId.POLYGON },
          { chainId: common.ChainId.base, endpointId: EndpointId.BASE },
          { chainId: common.ChainId.iota, endpointId: EndpointId.IOTA },
          { chainId: common.ChainId.arbitrum, endpointId: EndpointId.ARBITRUM },
        ],
      },
      {
        id: PoolId.USDT,
        token: common.avalancheTokens.USDt,
        address: '0x12dC9256Acc9895B076f6638D628382881e62CeE',
        destinations: [
          { chainId: common.ChainId.mainnet, endpointId: EndpointId.ETHEREUM },
          { chainId: common.ChainId.optimism, endpointId: EndpointId.OPTIMISM },
          { chainId: common.ChainId.bnb, endpointId: EndpointId.BNB },
          { chainId: common.ChainId.polygon, endpointId: EndpointId.POLYGON },
          { chainId: common.ChainId.metis, endpointId: EndpointId.METIS },
          { chainId: common.ChainId.iota, endpointId: EndpointId.IOTA },
          { chainId: common.ChainId.arbitrum, endpointId: EndpointId.ARBITRUM },
        ],
      },
    ],
  },
  {
    eid: EndpointId.POLYGON,
    chainId: common.ChainId.polygon,
    pools: [
      {
        id: PoolId.USDC,
        token: common.polygonTokens.USDC,
        address: '0x9Aa02D4Fae7F58b8E8f34c66E756cC734DAc7fe4',
        destinations: [
          { chainId: common.ChainId.mainnet, endpointId: EndpointId.ETHEREUM },
          { chainId: common.ChainId.optimism, endpointId: EndpointId.OPTIMISM },
          { chainId: common.ChainId.base, endpointId: EndpointId.BASE },
          { chainId: common.ChainId.iota, endpointId: EndpointId.IOTA },
          { chainId: common.ChainId.arbitrum, endpointId: EndpointId.ARBITRUM },
          { chainId: common.ChainId.avalanche, endpointId: EndpointId.AVALANCHE },
        ],
      },
      {
        id: PoolId.USDT,
        token: common.polygonTokens.USDT,
        address: '0xd47b03ee6d86Cf251ee7860FB2ACf9f91B9fD4d7',
        destinations: [
          { chainId: common.ChainId.mainnet, endpointId: EndpointId.ETHEREUM },
          { chainId: common.ChainId.optimism, endpointId: EndpointId.OPTIMISM },
          { chainId: common.ChainId.bnb, endpointId: EndpointId.BNB },
          { chainId: common.ChainId.metis, endpointId: EndpointId.METIS },
          { chainId: common.ChainId.iota, endpointId: EndpointId.IOTA },
          { chainId: common.ChainId.arbitrum, endpointId: EndpointId.ARBITRUM },
          { chainId: common.ChainId.avalanche, endpointId: EndpointId.AVALANCHE },
        ],
      },
    ],
  },
  {
    eid: EndpointId.ARBITRUM,
    chainId: common.ChainId.arbitrum,
    pools: [
      {
        id: PoolId.ETH,
        token: common.arbitrumTokens.ETH,
        address: '0xA45B5130f36CDcA45667738e2a258AB09f4A5f7F',
        destinations: [
          { chainId: common.ChainId.mainnet, endpointId: EndpointId.ETHEREUM },
          { chainId: common.ChainId.optimism, endpointId: EndpointId.OPTIMISM },
          { chainId: common.ChainId.metis, endpointId: EndpointId.METIS },
          { chainId: common.ChainId.base, endpointId: EndpointId.BASE },
          { chainId: common.ChainId.iota, endpointId: EndpointId.IOTA },
        ],
      },
      {
        id: PoolId.USDC,
        token: common.arbitrumTokens.USDC,
        address: '0xe8CDF27AcD73a434D661C84887215F7598e7d0d3',
        destinations: [
          { chainId: common.ChainId.mainnet, endpointId: EndpointId.ETHEREUM },
          { chainId: common.ChainId.optimism, endpointId: EndpointId.OPTIMISM },
          { chainId: common.ChainId.polygon, endpointId: EndpointId.POLYGON },
          { chainId: common.ChainId.base, endpointId: EndpointId.BASE },
          { chainId: common.ChainId.iota, endpointId: EndpointId.IOTA },
          { chainId: common.ChainId.avalanche, endpointId: EndpointId.AVALANCHE },
        ],
      },
      {
        id: PoolId.USDT,
        token: common.arbitrumTokens.USDT,
        address: '0xcE8CcA271Ebc0533920C83d39F417ED6A0abB7D0',
        destinations: [
          { chainId: common.ChainId.mainnet, endpointId: EndpointId.ETHEREUM },
          { chainId: common.ChainId.optimism, endpointId: EndpointId.OPTIMISM },
          { chainId: common.ChainId.bnb, endpointId: EndpointId.BNB },
          { chainId: common.ChainId.polygon, endpointId: EndpointId.POLYGON },
          { chainId: common.ChainId.metis, endpointId: EndpointId.METIS },
          { chainId: common.ChainId.iota, endpointId: EndpointId.IOTA },
          { chainId: common.ChainId.avalanche, endpointId: EndpointId.AVALANCHE },
        ],
      },
    ],
  },
  {
    eid: EndpointId.OPTIMISM,
    chainId: common.ChainId.optimism,
    pools: [
      {
        id: PoolId.ETH,
        token: common.optimismTokens.ETH,
        address: '0xe8CDF27AcD73a434D661C84887215F7598e7d0d3',
        destinations: [
          { chainId: common.ChainId.mainnet, endpointId: EndpointId.ETHEREUM },
          { chainId: common.ChainId.metis, endpointId: EndpointId.METIS },
          { chainId: common.ChainId.base, endpointId: EndpointId.BASE },
          { chainId: common.ChainId.iota, endpointId: EndpointId.IOTA },
          { chainId: common.ChainId.arbitrum, endpointId: EndpointId.ARBITRUM },
        ],
      },
      {
        id: PoolId.USDC,
        token: common.optimismTokens.USDC,
        address: '0xcE8CcA271Ebc0533920C83d39F417ED6A0abB7D0',
        destinations: [
          { chainId: common.ChainId.mainnet, endpointId: EndpointId.ETHEREUM },
          { chainId: common.ChainId.polygon, endpointId: EndpointId.POLYGON },
          { chainId: common.ChainId.base, endpointId: EndpointId.BASE },
          { chainId: common.ChainId.iota, endpointId: EndpointId.IOTA },
          { chainId: common.ChainId.arbitrum, endpointId: EndpointId.ARBITRUM },
          { chainId: common.ChainId.avalanche, endpointId: EndpointId.AVALANCHE },
        ],
      },
      {
        id: PoolId.USDT,
        token: common.optimismTokens.USDT,
        address: '0x19cFCE47eD54a88614648DC3f19A5980097007dD',
        destinations: [
          { chainId: common.ChainId.mainnet, endpointId: EndpointId.ETHEREUM },
          { chainId: common.ChainId.bnb, endpointId: EndpointId.BNB },
          { chainId: common.ChainId.polygon, endpointId: EndpointId.POLYGON },
          { chainId: common.ChainId.metis, endpointId: EndpointId.METIS },
          { chainId: common.ChainId.iota, endpointId: EndpointId.IOTA },
          { chainId: common.ChainId.arbitrum, endpointId: EndpointId.ARBITRUM },
          { chainId: common.ChainId.avalanche, endpointId: EndpointId.AVALANCHE },
        ],
      },
    ],
  },
  {
    eid: EndpointId.METIS,
    chainId: common.ChainId.metis,
    pools: [
      {
        id: PoolId.METIS,
        token: metisTokens.Metis,
        address: '0xD9050e7043102a0391F81462a3916326F86331F0',
        destinations: [{ chainId: common.ChainId.mainnet, endpointId: EndpointId.ETHEREUM }],
      },
      {
        id: PoolId.ETH,
        token: common.metisTokens.WETH,
        address: '0x36ed193dc7160D3858EC250e69D12B03Ca087D08',
        destinations: [
          { chainId: common.ChainId.mainnet, endpointId: EndpointId.ETHEREUM },
          { chainId: common.ChainId.optimism, endpointId: EndpointId.OPTIMISM },
          { chainId: common.ChainId.base, endpointId: EndpointId.BASE },
          { chainId: common.ChainId.iota, endpointId: EndpointId.IOTA },
          { chainId: common.ChainId.arbitrum, endpointId: EndpointId.ARBITRUM },
        ],
      },
      {
        id: PoolId.USDT,
        token: common.metisTokens['m.USDT'],
        address: '0x4dCBFC0249e8d5032F89D6461218a9D2eFff5125',
        destinations: [
          { chainId: common.ChainId.mainnet, endpointId: EndpointId.ETHEREUM },
          { chainId: common.ChainId.optimism, endpointId: EndpointId.OPTIMISM },
          { chainId: common.ChainId.bnb, endpointId: EndpointId.BNB },
          { chainId: common.ChainId.polygon, endpointId: EndpointId.POLYGON },
          { chainId: common.ChainId.iota, endpointId: EndpointId.IOTA },
          { chainId: common.ChainId.arbitrum, endpointId: EndpointId.ARBITRUM },
          { chainId: common.ChainId.avalanche, endpointId: EndpointId.AVALANCHE },
        ],
      },
    ],
  },
  {
    eid: EndpointId.BASE,
    chainId: common.ChainId.base,
    pools: [
      {
        id: PoolId.ETH,
        token: common.baseTokens.ETH,
        address: '0xdc181Bd607330aeeBEF6ea62e03e5e1Fb4B6F7C7',
        destinations: [
          { chainId: common.ChainId.mainnet, endpointId: EndpointId.ETHEREUM },
          { chainId: common.ChainId.optimism, endpointId: EndpointId.OPTIMISM },
          { chainId: common.ChainId.metis, endpointId: EndpointId.METIS },
          { chainId: common.ChainId.iota, endpointId: EndpointId.IOTA },
          { chainId: common.ChainId.arbitrum, endpointId: EndpointId.ARBITRUM },
        ],
      },
      {
        id: PoolId.USDC,
        token: common.baseTokens.USDC,
        address: '0x27a16dc786820B16E5c9028b75B99F6f604b5d26',
        destinations: [
          { chainId: common.ChainId.mainnet, endpointId: EndpointId.ETHEREUM },
          { chainId: common.ChainId.optimism, endpointId: EndpointId.OPTIMISM },
          { chainId: common.ChainId.polygon, endpointId: EndpointId.POLYGON },
          { chainId: common.ChainId.iota, endpointId: EndpointId.IOTA },
          { chainId: common.ChainId.arbitrum, endpointId: EndpointId.ARBITRUM },
          { chainId: common.ChainId.avalanche, endpointId: EndpointId.AVALANCHE },
        ],
      },
    ],
  },
  {
    eid: EndpointId.IOTA,
    chainId: common.ChainId.iota,
    pools: [
      {
        id: PoolId.ETH,
        token: common.iotaTokens.WETH,
        address: '0x9c2dc7377717603eB92b2655c5f2E7997a4945BD',
        destinations: [
          { chainId: common.ChainId.mainnet, endpointId: EndpointId.ETHEREUM },
          { chainId: common.ChainId.optimism, endpointId: EndpointId.OPTIMISM },
          { chainId: common.ChainId.metis, endpointId: EndpointId.METIS },
          { chainId: common.ChainId.base, endpointId: EndpointId.BASE },
          { chainId: common.ChainId.arbitrum, endpointId: EndpointId.ARBITRUM },
        ],
      },
      {
        id: PoolId.USDC,
        token: common.iotaTokens['USDC.e'],
        address: '0x8e8539e4CcD69123c623a106773F2b0cbbc58746',
        destinations: [
          { chainId: common.ChainId.mainnet, endpointId: EndpointId.ETHEREUM },
          { chainId: common.ChainId.optimism, endpointId: EndpointId.OPTIMISM },
          { chainId: common.ChainId.polygon, endpointId: EndpointId.POLYGON },
          { chainId: common.ChainId.arbitrum, endpointId: EndpointId.ARBITRUM },
          { chainId: common.ChainId.avalanche, endpointId: EndpointId.AVALANCHE },
        ],
      },
      {
        id: PoolId.USDT,
        token: common.iotaTokens.USDT,
        address: '0x77C71633C34C3784ede189d74223122422492a0f',
        destinations: [
          { chainId: common.ChainId.mainnet, endpointId: EndpointId.ETHEREUM },
          { chainId: common.ChainId.optimism, endpointId: EndpointId.OPTIMISM },
          { chainId: common.ChainId.bnb, endpointId: EndpointId.BNB },
          { chainId: common.ChainId.polygon, endpointId: EndpointId.POLYGON },
          { chainId: common.ChainId.metis, endpointId: EndpointId.METIS },
          { chainId: common.ChainId.arbitrum, endpointId: EndpointId.ARBITRUM },
          { chainId: common.ChainId.avalanche, endpointId: EndpointId.AVALANCHE },
        ],
      },
    ],
  },
];

export const [supportedChainIds, configMap, configMapById, tokensMap, poolConfigMapById, poolConfigMapByToken] =
  configs.reduce(
    (accumulator, config) => {
      accumulator[0].push(config.chainId);
      accumulator[1][config.chainId] = config;
      accumulator[2][config.eid] = config;
      accumulator[3][config.chainId] = new Set();
      accumulator[4][config.chainId] = {};
      accumulator[5][config.chainId] = {};
      for (const pool of config.pools) {
        accumulator[3][config.chainId].add(pool.token);
        accumulator[4][config.chainId][pool.id] = { chainId: config.chainId, ...pool };
        accumulator[5][config.chainId][pool.token.address] = { chainId: config.chainId, ...pool };
      }

      return accumulator;
    },
    [[], {}, {}, {}, {}, {}] as [
      number[],
      Record<number, Config>,
      Record<number, Config>,
      Record<number, Set<common.Token>>,
      Record<number, Record<number, PoolConfig>>,
      Record<number, Record<string, PoolConfig>>
    ]
  );

export function getMarkets(chainId: number) {
  return configMap[chainId].pools;
}

export function getEndpointId(chainId: number) {
  return configMap[chainId].eid;
}

export function getTokens(chainId: number) {
  return [...tokensMap[chainId]];
}

export function getPoolByTokenAddress(chainId: number, tokenAddress: string) {
  return poolConfigMapByToken[chainId][tokenAddress].address;
}

export function getDestChainIds(srcChainId: number, srcToken: common.Token) {
  const destChainIds = new Set<number>();
  const srcPoolConfig = poolConfigMapByToken[srcChainId][srcToken.address] ?? [];
  for (const destination of srcPoolConfig.destinations) {
    destChainIds.add(destination.chainId);
  }
  return [...destChainIds];
}

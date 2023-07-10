import * as common from '@protocolink/common';

type ContractNames = 'CometRewards';

export enum MarketId {
  USDC = 'USDC',
  ETH = 'ETH',
}

export interface MarketConfig {
  id: string;
  cometAddress: string;
  baseTokenAddress: string;
}

export interface Config {
  chainId: number;
  contract: Record<ContractNames, string>;
  markets: MarketConfig[];
  COMP: common.Token;
}

export const configs: Config[] = [
  {
    chainId: common.ChainId.mainnet,
    contract: {
      CometRewards: '0x1B0e765F6224C21223AeA2af16c1C46E38885a40',
    },
    markets: [
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
    COMP: new common.Token(
      common.ChainId.mainnet,
      '0xc00e94Cb662C3520282E6f5717214004A7f26888',
      18,
      'COMP',
      'Compound'
    ),
  },
  {
    chainId: common.ChainId.polygon,
    contract: {
      CometRewards: '0x45939657d1CA34A8FA39A924B71D28Fe8431e581',
    },
    markets: [
      {
        id: MarketId.USDC,
        cometAddress: '0xF25212E676D1F7F89Cd72fFEe66158f541246445',
        baseTokenAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      },
    ],
    COMP: new common.Token(
      common.ChainId.polygon,
      '0x8505b9d2254A7Ae468c0E9dd10Ccea3A837aef5c',
      18,
      'COMP',
      '(PoS) Compound'
    ),
  },
  {
    chainId: common.ChainId.arbitrum,
    contract: {
      CometRewards: '0x45939657d1CA34A8FA39A924B71D28Fe8431e581',
    },
    markets: [
      {
        id: MarketId.USDC,
        cometAddress: '0xA5EDBDD9646f8dFF606d7448e414884C7d905dCA',
        baseTokenAddress: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      },
    ],
    COMP: new common.Token(
      common.ChainId.arbitrum,
      '0x354A6dA3fcde098F8389cad84b0182725c6C91dE',
      18,
      'COMP',
      'Compound'
    ),
  },
];

export const [supportedChainIds, configMap, marketMap, COMPMap] = configs.reduce(
  (accumulator, config) => {
    accumulator[0].push(config.chainId);
    accumulator[1][config.chainId] = config;
    accumulator[2][config.chainId] = {};
    for (const market of config.markets) {
      accumulator[2][config.chainId][market.id] = market;
    }
    accumulator[3][config.chainId] = config.COMP;

    return accumulator;
  },
  [[], {}, {}, {}] as [
    number[],
    Record<number, Config>,
    Record<number, Record<string, MarketConfig>>,
    Record<number, common.Token>
  ]
);

export function getMarkets(chainId: number) {
  return configMap[chainId].markets;
}

export function getMarket(chainId: number, id: string) {
  return marketMap[chainId][id];
}

export function getContractAddress(chainId: number, name: ContractNames) {
  return configMap[chainId].contract[name];
}

export function COMP(chainId: number) {
  return COMPMap[chainId];
}

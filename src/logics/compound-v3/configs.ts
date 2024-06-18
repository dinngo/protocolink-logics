import { arbitrumTokens, baseTokens, mainnetTokens, optimismTokens, polygonTokens } from './tokens';
import * as common from '@protocolink/common';

type ContractNames = 'CometRewards';

export enum MarketId {
  USDC = 'USDC',
  USDCe = 'USDC.e',
  USDbC = 'USDbC',
  ETH = 'ETH',
}

export interface MarketConfig {
  id: string;
  comet: common.Token;
  baseToken: common.Token;
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
        comet: mainnetTokens.cUSDCv3,
        baseToken: mainnetTokens.USDC,
      },
      {
        id: MarketId.ETH,
        comet: mainnetTokens.cWETHv3,
        baseToken: mainnetTokens.WETH,
      },
    ],
    COMP: mainnetTokens.COMP,
  },
  {
    chainId: common.ChainId.optimism,
    contract: {
      CometRewards: '0x443EA0340cb75a160F31A440722dec7b5bc3C2E9',
    },
    markets: [
      {
        id: MarketId.USDC,
        comet: optimismTokens.cUSDCv3,
        baseToken: optimismTokens.USDC,
      },
    ],
    COMP: optimismTokens.COMP,
  },
  {
    chainId: common.ChainId.polygon,
    contract: {
      CometRewards: '0x45939657d1CA34A8FA39A924B71D28Fe8431e581',
    },
    markets: [
      {
        id: MarketId.USDCe,
        comet: polygonTokens.cUSDCv3,
        baseToken: polygonTokens['USDC.e'],
      },
    ],
    COMP: polygonTokens.COMP,
  },
  {
    chainId: common.ChainId.base,
    contract: {
      CometRewards: '0x123964802e6ABabBE1Bc9547D72Ef1B69B00A6b1',
    },
    markets: [
      {
        id: MarketId.USDC,
        comet: baseTokens.cUSDCv3,
        baseToken: baseTokens.USDC,
      },
      {
        id: MarketId.USDbC,
        comet: baseTokens.cUSDbCv3,
        baseToken: baseTokens.USDbC,
      },
      {
        id: MarketId.ETH,
        comet: baseTokens.cWETHv3,
        baseToken: baseTokens.WETH,
      },
    ],
    COMP: baseTokens.COMP,
  },
  {
    chainId: common.ChainId.arbitrum,
    contract: {
      CometRewards: '0x45939657d1CA34A8FA39A924B71D28Fe8431e581',
    },
    markets: [
      {
        id: MarketId.USDCe,
        comet: arbitrumTokens.cUSDCev3,
        baseToken: arbitrumTokens['USDC.e'],
      },
      {
        id: MarketId.USDC,
        comet: arbitrumTokens.cUSDCv3,
        baseToken: arbitrumTokens.USDC,
      },
    ],
    COMP: arbitrumTokens.COMP,
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

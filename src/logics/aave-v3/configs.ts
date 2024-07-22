import * as common from '@protocolink/common';

export const protocolId = 'aave-v3';

type ContractNames = 'PoolDataProvider' | 'AaveV3FlashLoanCallback';

export interface Config {
  chainId: number;
  contract: Record<ContractNames, string>;
}

export const configs: Config[] = [
  {
    chainId: common.ChainId.mainnet,
    contract: {
      PoolDataProvider: '0x7B4EB56E7CD4b454BA8ff71E4518426369a138a3',
      AaveV3FlashLoanCallback: '0x6f81cf774052D03873b32944a036BF0647bFB5bF',
    },
  },
  {
    chainId: common.ChainId.optimism,
    contract: {
      PoolDataProvider: '0xd9Ca4878dd38B021583c1B669905592EAe76E044',
      AaveV3FlashLoanCallback: '0x6f81cf774052D03873b32944a036BF0647bFB5bF',
    },
  },
  {
    chainId: common.ChainId.gnosis,
    contract: {
      PoolDataProvider: '0x501B4c19dd9C2e06E94dA7b6D5Ed4ddA013EC741',
      AaveV3FlashLoanCallback: '0x6f81cf774052D03873b32944a036BF0647bFB5bF',
    },
  },
  {
    chainId: common.ChainId.polygon,
    contract: {
      PoolDataProvider: '0x9441B65EE553F70df9C77d45d3283B6BC24F222d',
      AaveV3FlashLoanCallback: '0x6f81cf774052D03873b32944a036BF0647bFB5bF',
    },
  },
  {
    chainId: common.ChainId.metis,
    contract: {
      PoolDataProvider: '0x99411FC17Ad1B56f49719E3850B2CDcc0f9bBFd8',
      AaveV3FlashLoanCallback: '0x6f81cf774052D03873b32944a036BF0647bFB5bF',
    },
  },
  {
    chainId: common.ChainId.base,
    contract: {
      PoolDataProvider: '0x2d8A3C5677189723C4cB8873CfC9C8976FDF38Ac',
      AaveV3FlashLoanCallback: '0x6f81cf774052D03873b32944a036BF0647bFB5bF',
    },
  },
  {
    chainId: common.ChainId.arbitrum,
    contract: {
      PoolDataProvider: '0x6b4E260b765B3cA1514e618C0215A6B7839fF93e',
      AaveV3FlashLoanCallback: '0x6f81cf774052D03873b32944a036BF0647bFB5bF',
    },
  },
  {
    chainId: common.ChainId.avalanche,
    contract: {
      PoolDataProvider: '0x50ddd0Cd4266299527d25De9CBb55fE0EB8dAc30',
      AaveV3FlashLoanCallback: '0x6f81cf774052D03873b32944a036BF0647bFB5bF',
    },
  },
];

export const [supportedChainIds, configMap] = configs.reduce(
  (accumulator, config) => {
    accumulator[0].push(config.chainId);
    accumulator[1][config.chainId] = config;
    return accumulator;
  },
  [[], {}] as [number[], Record<number, Config>]
);

export function getContractAddress(chainId: number, name: ContractNames) {
  return configMap[chainId].contract[name];
}

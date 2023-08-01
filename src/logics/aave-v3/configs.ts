import * as common from '@protocolink/common';

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
      AaveV3FlashLoanCallback: '0xe1356560B683cA54e7D7e9e81b05319E9140a977',
    },
  },
  {
    chainId: common.ChainId.polygon,
    contract: {
      PoolDataProvider: '0x9441B65EE553F70df9C77d45d3283B6BC24F222d',
      AaveV3FlashLoanCallback: '0xe1356560B683cA54e7D7e9e81b05319E9140a977',
    },
  },
  {
    chainId: common.ChainId.arbitrum,
    contract: {
      PoolDataProvider: '0x6b4E260b765B3cA1514e618C0215A6B7839fF93e',
      AaveV3FlashLoanCallback: '0xe1356560B683cA54e7D7e9e81b05319E9140a977',
    },
  },
  {
    chainId: common.ChainId.optimism,
    contract: {
      PoolDataProvider: '0xd9Ca4878dd38B021583c1B669905592EAe76E044',
      AaveV3FlashLoanCallback: '0xe1356560B683cA54e7D7e9e81b05319E9140a977',
    },
  },
  {
    chainId: common.ChainId.avalanche,
    contract: {
      PoolDataProvider: '0x50ddd0Cd4266299527d25De9CBb55fE0EB8dAc30',
      AaveV3FlashLoanCallback: '0xe1356560B683cA54e7D7e9e81b05319E9140a977',
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

export function setContractAddress(chainId: number, name: ContractNames, address: string) {
  for (let i = 0; i < configs.length; i++) {
    if (configs[i].chainId === chainId) {
      configs[i].contract[name] = address;
      break;
    }
  }
  configMap[chainId].contract[name] = address;
}

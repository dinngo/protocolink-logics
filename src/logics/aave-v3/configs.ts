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
      AaveV3FlashLoanCallback: '0x6ea614B4C520c8abC9B0F50803Bef964D4DA81EB',
    },
  },
  {
    chainId: common.ChainId.polygon,
    contract: {
      PoolDataProvider: '0x9441B65EE553F70df9C77d45d3283B6BC24F222d',
      AaveV3FlashLoanCallback: '0x6ea614B4C520c8abC9B0F50803Bef964D4DA81EB',
    },
  },
  {
    chainId: common.ChainId.arbitrum,
    contract: {
      PoolDataProvider: '0x6b4E260b765B3cA1514e618C0215A6B7839fF93e',
      AaveV3FlashLoanCallback: '0x6ea614B4C520c8abC9B0F50803Bef964D4DA81EB',
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

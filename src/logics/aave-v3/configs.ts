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
      AaveV3FlashLoanCallback: '0x48060855cdAeFf1fE806d46dd592606A8F6cA760',
    },
  },
  {
    chainId: common.ChainId.polygon,
    contract: {
      PoolDataProvider: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
      AaveV3FlashLoanCallback: '0x48060855cdAeFf1fE806d46dd592606A8F6cA760',
    },
  },
  {
    chainId: common.ChainId.arbitrum,
    contract: {
      PoolDataProvider: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
      AaveV3FlashLoanCallback: '0x48060855cdAeFf1fE806d46dd592606A8F6cA760',
    },
  },
  {
    chainId: common.ChainId.optimism,
    contract: {
      PoolDataProvider: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
      AaveV3FlashLoanCallback: '',
    },
  },
  {
    chainId: common.ChainId.avalanche,
    contract: {
      PoolDataProvider: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
      AaveV3FlashLoanCallback: '',
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

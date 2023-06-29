import * as common from '@protocolink/common';

type ContractNames = 'ProtocolDataProvider' | 'AaveV2FlashLoanCallback';

export interface Config {
  chainId: number;
  contract: Record<ContractNames, string>;
}

export const configs: Config[] = [
  {
    chainId: common.ChainId.mainnet,
    contract: {
      ProtocolDataProvider: '0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d',
      AaveV2FlashLoanCallback: '0x1aAb5e8217042f5f4988Fc808A054924006957B9',
    },
  },
  {
    chainId: common.ChainId.polygon,
    contract: {
      ProtocolDataProvider: '0x7551b5D2763519d4e37e8B81929D336De671d46d',
      AaveV2FlashLoanCallback: '',
    },
  },
  {
    chainId: common.ChainId.avalanche,
    contract: {
      ProtocolDataProvider: '0x65285E9dfab318f57051ab2b139ccCf232945451',
      AaveV2FlashLoanCallback: '',
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

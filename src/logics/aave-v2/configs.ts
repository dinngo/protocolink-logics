import * as common from '@protocolink/common';

export const protocolId = 'aave-v2';

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
      AaveV2FlashLoanCallback: '0x727c55092C7196d65594A8e4F39ae8dC0cB39173',
    },
  },
  {
    chainId: common.ChainId.polygon,
    contract: {
      ProtocolDataProvider: '0x7551b5D2763519d4e37e8B81929D336De671d46d',
      AaveV2FlashLoanCallback: '0x727c55092C7196d65594A8e4F39ae8dC0cB39173',
    },
  },
  {
    chainId: common.ChainId.avalanche,
    contract: {
      ProtocolDataProvider: '0x65285E9dfab318f57051ab2b139ccCf232945451',
      AaveV2FlashLoanCallback: '0x727c55092C7196d65594A8e4F39ae8dC0cB39173',
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

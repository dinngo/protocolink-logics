import * as common from '@protocolink/common';

export const protocolId = 'radiant-v2';

type ContractNames = 'ProtocolDataProvider' | 'RadiantV2FlashLoanCallback';

export interface Config {
  chainId: number;
  contract: Record<ContractNames, string>;
}

export const configs: Config[] = [
  {
    chainId: common.ChainId.mainnet,
    contract: {
      ProtocolDataProvider: '0x362f3BB63Cff83bd169aE1793979E9e537993813',
      RadiantV2FlashLoanCallback: '0x6bfCE075A1c4F0fD4067A401dA8f159354e1a916',
    },
  },
  {
    chainId: common.ChainId.base,
    contract: {
      ProtocolDataProvider: '0x07d2DC09A1CbDD01e5f6Ca984b060A3Ff31b9EAF',
      RadiantV2FlashLoanCallback: '0x6bfCE075A1c4F0fD4067A401dA8f159354e1a916',
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

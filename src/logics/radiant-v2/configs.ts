import * as common from '@protocolink/common';

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
    chainId: common.ChainId.bnb,
    contract: {
      ProtocolDataProvider: '0x2f9D57E97C3DFED8676e605BC504a48E0c5917E9',
      RadiantV2FlashLoanCallback: '0x6bfCE075A1c4F0fD4067A401dA8f159354e1a916',
    },
  },
  {
    chainId: common.ChainId.arbitrum,
    contract: {
      ProtocolDataProvider: '0x596B0cc4c5094507C50b579a662FE7e7b094A2cC',
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

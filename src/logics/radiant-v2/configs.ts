import * as common from '@protocolink/common';

type ContractNames = 'ProtocolDataProvider' | 'RadiantV2FlashLoanCallback';

export interface Config {
  chainId: number;
  contract: Record<ContractNames, string>;
}

export const configs: Config[] = [
  {
    chainId: common.ChainId.arbitrum,
    contract: {
      ProtocolDataProvider: '0x596B0cc4c5094507C50b579a662FE7e7b094A2cC',
      RadiantV2FlashLoanCallback: '0xC1a22F8A12F4D42D6f2C645fc87bB896A4f150c8',
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

import * as common from '@protocolink/common';

export const protocolId = 'iolend';

type ContractNames = 'ProtocolDataProvider';

export interface Config {
  chainId: number;
  contract: Record<ContractNames, string>;
}

export const configs: Config[] = [
  {
    chainId: common.ChainId.iota,
    contract: {
      ProtocolDataProvider: '0x779a294CF4D200936881c4c8d0771b8a1935fB5B',
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

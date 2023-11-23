import * as common from '@protocolink/common';

type ContractNames = 'PoolDataProvider' | 'SparkFlashLoanCallback';

export interface Config {
  chainId: number;
  contract: Record<ContractNames, string>;
}

export const configs: Config[] = [
  {
    chainId: common.ChainId.mainnet,
    contract: {
      PoolDataProvider: '0xFc21d6d146E6086B8359705C8b28512a983db0cb',
      SparkFlashLoanCallback: '0x9174a45468d055Cc2Fa18e708E8CeACD46050359',
    },
  },
  {
    chainId: common.ChainId.gnosis,
    contract: {
      PoolDataProvider: '0x2a002054A06546bB5a264D57A81347e23Af91D18',
      SparkFlashLoanCallback: '0x9174a45468d055Cc2Fa18e708E8CeACD46050359',
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

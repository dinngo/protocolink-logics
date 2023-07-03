import * as common from '@protocolink/common';

type ContractNames = 'Permit2';

interface Config {
  chainId: number;
  contract: Record<ContractNames, string>;
}

export const configs: Config[] = [
  {
    chainId: common.ChainId.mainnet,
    contract: {
      Permit2: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
    },
  },
  {
    chainId: common.ChainId.polygon,
    contract: {
      Permit2: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
    },
  },
  {
    chainId: common.ChainId.arbitrum,
    contract: {
      Permit2: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
    },
  },
  {
    chainId: common.ChainId.optimism,
    contract: {
      Permit2: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
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

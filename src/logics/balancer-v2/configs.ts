import * as common from '@protocolink/common';

type ContractNames = 'Vault' | 'BalancerV2FlashLoanCallback' | 'ProtocolFeesCollector';

export interface Config {
  chainId: number;
  contract: Record<ContractNames, string>;
}

export const configs: Config[] = [
  {
    chainId: common.ChainId.mainnet,
    contract: {
      Vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      BalancerV2FlashLoanCallback: '0xA15B9C132F29e91D99b51E3080020eF7c7F5E350',
      ProtocolFeesCollector: '0xce88686553686DA562CE7Cea497CE749DA109f9F',
    },
  },
  {
    chainId: common.ChainId.optimism,
    contract: {
      Vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      BalancerV2FlashLoanCallback: '0xA15B9C132F29e91D99b51E3080020eF7c7F5E350',
      ProtocolFeesCollector: '0xce88686553686DA562CE7Cea497CE749DA109f9F',
    },
  },
  {
    chainId: common.ChainId.polygon,
    contract: {
      Vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      BalancerV2FlashLoanCallback: '0xA15B9C132F29e91D99b51E3080020eF7c7F5E350',
      ProtocolFeesCollector: '0xce88686553686DA562CE7Cea497CE749DA109f9F',
    },
  },
  {
    chainId: common.ChainId.base,
    contract: {
      Vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      BalancerV2FlashLoanCallback: '0xA15B9C132F29e91D99b51E3080020eF7c7F5E350',
      ProtocolFeesCollector: '0xce88686553686DA562CE7Cea497CE749DA109f9F',
    },
  },
  {
    chainId: common.ChainId.arbitrum,
    contract: {
      Vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      BalancerV2FlashLoanCallback: '0xA15B9C132F29e91D99b51E3080020eF7c7F5E350',
      ProtocolFeesCollector: '0xce88686553686DA562CE7Cea497CE749DA109f9F',
    },
  },
  {
    chainId: common.ChainId.avalanche,
    contract: {
      Vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      BalancerV2FlashLoanCallback: '0xA15B9C132F29e91D99b51E3080020eF7c7F5E350',
      ProtocolFeesCollector: '0xce88686553686DA562CE7Cea497CE749DA109f9F',
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

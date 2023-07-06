import * as common from '@protocolink/common';

type ContractNames = 'Vault' | 'BalancerV2FlashLoanCallback';

export interface Config {
  chainId: number;
  contract: Record<ContractNames, string>;
}

export const configs: Config[] = [
  {
    chainId: common.ChainId.mainnet,
    contract: {
      Vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      BalancerV2FlashLoanCallback: '0xCD8063C4Edb42f6eC6d41295268D60Fa525401A4',
    },
  },
  {
    chainId: common.ChainId.polygon,
    contract: {
      Vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      BalancerV2FlashLoanCallback: '0xCD8063C4Edb42f6eC6d41295268D60Fa525401A4',
    },
  },
  {
    chainId: common.ChainId.arbitrum,
    contract: {
      Vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      BalancerV2FlashLoanCallback: '0xCD8063C4Edb42f6eC6d41295268D60Fa525401A4',
    },
  },
  {
    chainId: common.ChainId.optimism,
    contract: {
      Vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      BalancerV2FlashLoanCallback: '',
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

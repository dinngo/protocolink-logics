import * as common from '@protocolink/common';

export interface Config {
  chainId: number;
  exchangeAddress: string;
  gasPrice: string;
}

export const configs: Config[] = [
  {
    chainId: common.ChainId.gnosis,
    exchangeAddress: '0x6352a56caadC4F1E25CD6c75970Fa768A3304e64',
    gasPrice: '14',
  },
  {
    chainId: common.ChainId.metis,
    exchangeAddress: '0x6352a56caadC4F1E25CD6c75970Fa768A3304e64',
    gasPrice: '20',
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

export function getExchangeAddress(chainId: number) {
  return configMap[chainId].exchangeAddress;
}

export function getGasPrice(chainId: number) {
  return configMap[chainId].gasPrice;
}

export function getApiUrl(chainId: number) {
  const url = 'https://open-api.openocean.finance/v3';
  return url + `/${chainId}`;
}

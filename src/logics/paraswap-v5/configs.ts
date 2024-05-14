import * as common from '@protocolink/common';
import { getDefaultTokenListUrls } from 'src/utils/tokens';

export interface Config {
  chainId: number;
  tokenTransferProxyAddress: string;
  tokenListUrls: string[];
}

export const configs: Config[] = [
  {
    chainId: common.ChainId.mainnet,
    tokenTransferProxyAddress: '0x216B4B4Ba9F3e719726886d34a177484278Bfcae',
    tokenListUrls: getDefaultTokenListUrls(common.ChainId.mainnet),
  },
  {
    chainId: common.ChainId.optimism,
    tokenTransferProxyAddress: '0x216B4B4Ba9F3e719726886d34a177484278Bfcae',
    tokenListUrls: getDefaultTokenListUrls(common.ChainId.optimism),
  },
  {
    chainId: common.ChainId.bnb,
    tokenTransferProxyAddress: '0x216B4B4Ba9F3e719726886d34a177484278Bfcae',
    tokenListUrls: getDefaultTokenListUrls(common.ChainId.bnb),
  },
  {
    chainId: common.ChainId.polygon,
    tokenTransferProxyAddress: '0x216B4B4Ba9F3e719726886d34a177484278Bfcae',
    tokenListUrls: getDefaultTokenListUrls(common.ChainId.polygon),
  },
  {
    chainId: common.ChainId.base,
    tokenTransferProxyAddress: '0x93aAAe79a53759cD164340E4C8766E4Db5331cD7',
    tokenListUrls: getDefaultTokenListUrls(common.ChainId.base),
  },
  {
    chainId: common.ChainId.arbitrum,
    tokenTransferProxyAddress: '0x216B4B4Ba9F3e719726886d34a177484278Bfcae',
    tokenListUrls: getDefaultTokenListUrls(common.ChainId.arbitrum),
  },
  {
    chainId: common.ChainId.avalanche,
    tokenTransferProxyAddress: '0x216B4B4Ba9F3e719726886d34a177484278Bfcae',
    tokenListUrls: getDefaultTokenListUrls(common.ChainId.avalanche),
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

export function getTokenListUrls(chainId: number) {
  return configMap[chainId].tokenListUrls;
}

export function getTokenTransferProxyAddress(chainId: number) {
  return configMap[chainId].tokenTransferProxyAddress;
}

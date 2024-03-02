import * as common from '@protocolink/common';
import { getDefaultTokenListUrls } from 'src/utils/tokens';

export interface Configs {
  chainId: number;
  exchangeProxyAddress: string;
  tokenListUrls: string[];
}

export const configs: Configs[] = [
  {
    chainId: common.ChainId.mainnet,
    exchangeProxyAddress: '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
    tokenListUrls: getDefaultTokenListUrls(common.ChainId.mainnet),
  },
  {
    chainId: common.ChainId.optimism,
    exchangeProxyAddress: '0xdef1abe32c034e558cdd535791643c58a13acc10',
    tokenListUrls: getDefaultTokenListUrls(common.ChainId.optimism),
  },
  {
    chainId: common.ChainId.polygon,
    exchangeProxyAddress: '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
    tokenListUrls: getDefaultTokenListUrls(common.ChainId.polygon),
  },
  {
    chainId: common.ChainId.base,
    exchangeProxyAddress: '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
    tokenListUrls: getDefaultTokenListUrls(common.ChainId.base),
  },
  {
    chainId: common.ChainId.arbitrum,
    exchangeProxyAddress: '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
    tokenListUrls: getDefaultTokenListUrls(common.ChainId.arbitrum),
  },
  {
    chainId: common.ChainId.avalanche,
    exchangeProxyAddress: '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
    tokenListUrls: getDefaultTokenListUrls(common.ChainId.avalanche),
  },
];

export const [supportedChainIds, configMap] = configs.reduce(
  (accumulator, config) => {
    accumulator[0].push(config.chainId);
    accumulator[1][config.chainId] = config;
    return accumulator;
  },
  [[], {}] as [number[], Record<number, Configs>]
);

export function getTokenListUrls(chainId: number) {
  return configMap[chainId].tokenListUrls;
}

export function getExchangeProxyAddress(chainId: number) {
  return configMap[chainId].exchangeProxyAddress;
}

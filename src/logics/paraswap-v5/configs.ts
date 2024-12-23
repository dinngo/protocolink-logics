import * as common from '@protocolink/common';

export interface Config {
  chainId: number;
  tokenTransferProxyAddress: string;
  tokenListUrls: string[];
}

export const configs: Config[] = [
  {
    chainId: common.ChainId.mainnet,
    tokenTransferProxyAddress: '0x216B4B4Ba9F3e719726886d34a177484278Bfcae',
    tokenListUrls: [
      'https://raw.githubusercontent.com/paraswap/community-token-list/master/src/sources/paraswap.extralist.json',
      'https://raw.githubusercontent.com/bgd-labs/aave-address-book/main/tokenlist.json',
      'https://tokens.uniswap.org',
    ],
  },
  {
    chainId: common.ChainId.optimism,
    tokenTransferProxyAddress: '0x216B4B4Ba9F3e719726886d34a177484278Bfcae',
    tokenListUrls: [
      'https://static.optimism.io/optimism.tokenlist.json',
      'https://tokens.coingecko.com/optimistic-ethereum/all.json',
      'https://raw.githubusercontent.com/bgd-labs/aave-address-book/main/tokenlist.json',
    ],
  },
  {
    chainId: common.ChainId.bnb,
    tokenTransferProxyAddress: '0x216B4B4Ba9F3e719726886d34a177484278Bfcae',
    tokenListUrls: [
      'https://tokens.pancakeswap.finance/pancakeswap-extended.json',
      'https://raw.githubusercontent.com/bgd-labs/aave-address-book/main/tokenlist.json',
    ],
  },
  {
    chainId: common.ChainId.polygon,
    tokenTransferProxyAddress: '0x216B4B4Ba9F3e719726886d34a177484278Bfcae',
    tokenListUrls: [
      'https://unpkg.com/quickswap-default-token-list@latest/build/quickswap-default.tokenlist.json',
      'https://unpkg.com/@cometh-game/default-token-list@latest/build/comethswap-default.tokenlist.json',
      'https://raw.githubusercontent.com/bgd-labs/aave-address-book/main/tokenlist.json',
      'https://tokens.coingecko.com/polygon-pos/all.json',
    ],
  },
  {
    chainId: common.ChainId.polygonZkevm,
    tokenTransferProxyAddress: '0xC8a21FcD5A100c3ecc037c97e2f9C53a8D3A02A1',
    tokenListUrls: ['https://unpkg.com/quickswap-default-token-list@latest/build/quickswap-default.tokenlist.json'],
  },
  {
    chainId: common.ChainId.base,
    tokenTransferProxyAddress: '0x93aAAe79a53759cD164340E4C8766E4Db5331cD7',
    tokenListUrls: [
      'https://static.optimism.io/optimism.tokenlist.json',
      'https://raw.githubusercontent.com/bgd-labs/aave-address-book/main/tokenlist.json',
    ],
  },
  {
    chainId: common.ChainId.arbitrum,
    tokenTransferProxyAddress: '0x216B4B4Ba9F3e719726886d34a177484278Bfcae',
    tokenListUrls: [
      'https://raw.githubusercontent.com/paraswap/community-token-list/master/src/sources/paraswap.extralist.json',
      'https://bridge.arbitrum.io/token-list-42161.json',
      'https://tokens.coingecko.com/arbitrum-one/all.json',
      'https://raw.githubusercontent.com/bgd-labs/aave-address-book/main/tokenlist.json',
    ],
  },
  {
    chainId: common.ChainId.avalanche,
    tokenTransferProxyAddress: '0x216B4B4Ba9F3e719726886d34a177484278Bfcae',
    tokenListUrls: [
      'https://raw.githubusercontent.com/pangolindex/tokenlists/main/pangolin.tokenlist.json',
      'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/mc.tokenlist.json',
      'https://tokens.coingecko.com/avalanche/all.json',
      'https://raw.githubusercontent.com/bgd-labs/aave-address-book/main/tokenlist.json',
    ],
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

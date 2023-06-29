import * as common from '@protocolink/common';

export const tokenTransferProxyAddress = '0x216B4B4Ba9F3e719726886d34a177484278Bfcae';

export interface Config {
  chainId: number;
  tokenListUrls: string[];
}

export const configs: Config[] = [
  {
    chainId: common.ChainId.mainnet,
    tokenListUrls: [
      'https://raw.githubusercontent.com/paraswap/community-token-list/master/src/sources/paraswap.extralist.json',
      'https://wispy-bird-88a7.uniswap.workers.dev/?url=http://tokenlist.aave.eth.link',
      'https://gateway.ipfs.io/ipns/tokens.uniswap.org',
    ],
  },
  {
    chainId: common.ChainId.polygon,
    tokenListUrls: [
      'https://unpkg.com/quickswap-default-token-list@1.2.74/build/quickswap-default.tokenlist.json',
      'https://unpkg.com/@cometh-game/default-token-list@1.0.40/build/comethswap-default.tokenlist.json',
      'https://tokens.coingecko.com/polygon-pos/all.json',
    ],
  },
  {
    chainId: common.ChainId.arbitrum,
    tokenListUrls: [
      'https://raw.githubusercontent.com/paraswap/community-token-list/master/src/sources/paraswap.extralist.json',
      'https://tokenlist.arbitrum.io/ArbTokenLists/arbed_arb_whitelist_era.json',
      'https://tokens.coingecko.com/arbitrum-one/all.json',
    ],
  },
  {
    chainId: common.ChainId.optimism,
    tokenListUrls: [
      'https://static.optimism.io/optimism.tokenlist.json',
      'https://tokens.coingecko.com/optimistic-ethereum/all.json',
    ],
  },
  {
    chainId: common.ChainId.avalanche,
    tokenListUrls: [
      'https://raw.githubusercontent.com/pangolindex/tokenlists/main/pangolin.tokenlist.json',
      'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/mc.tokenlist.json',
      'https://tokens.coingecko.com/avalanche/all.json',
    ],
  },
  {
    chainId: common.ChainId.fantom,
    tokenListUrls: [
      'https://raw.githubusercontent.com/SpookySwap/spooky-info/master/src/constants/token/spookyswap.json',
      'https://tokens.coingecko.com/fantom/all.json',
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

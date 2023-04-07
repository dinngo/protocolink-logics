import * as common from '@furucombo/composable-router-common';

type ContractNames = 'TokenTransferProxy';

export const contractAddressMap: Record<number, { [k in ContractNames]: string }> = {
  [common.ChainId.mainnet]: {
    TokenTransferProxy: '0x216B4B4Ba9F3e719726886d34a177484278Bfcae',
  },
  [common.ChainId.polygon]: {
    TokenTransferProxy: '0x216B4B4Ba9F3e719726886d34a177484278Bfcae',
  },
  [common.ChainId.arbitrum]: {
    TokenTransferProxy: '0x216B4B4Ba9F3e719726886d34a177484278Bfcae',
  },
  [common.ChainId.optimism]: {
    TokenTransferProxy: '0x216B4B4Ba9F3e719726886d34a177484278Bfcae',
  },
  [common.ChainId.avalanche]: {
    TokenTransferProxy: '0x216B4B4Ba9F3e719726886d34a177484278Bfcae',
  },
};

export function getContractAddress(chainId: number, name: ContractNames) {
  return contractAddressMap[chainId][name];
}

export const tokenListUrlsMap: Record<number, string[]> = {
  [common.ChainId.mainnet]: [
    'https://raw.githubusercontent.com/paraswap/community-token-list/master/src/sources/paraswap.extralist.json',
    'https://wispy-bird-88a7.uniswap.workers.dev/?url=http://tokenlist.aave.eth.link',
    'https://gateway.ipfs.io/ipns/tokens.uniswap.org',
  ],
  [common.ChainId.polygon]: [
    'https://unpkg.com/quickswap-default-token-list@1.2.74/build/quickswap-default.tokenlist.json',
    'https://unpkg.com/@cometh-game/default-token-list@1.0.40/build/comethswap-default.tokenlist.json',
    'https://tokens.coingecko.com/polygon-pos/all.json',
  ],
  [common.ChainId.arbitrum]: [
    'https://raw.githubusercontent.com/paraswap/community-token-list/master/src/sources/paraswap.extralist.json',
    'https://tokenlist.arbitrum.io/ArbTokenLists/arbed_arb_whitelist_era.json',
    'https://tokens.coingecko.com/arbitrum-one/all.json',
  ],
  [common.ChainId.optimism]: [
    'https://static.optimism.io/optimism.tokenlist.json',
    'https://tokens.coingecko.com/optimistic-ethereum/all.json',
  ],
  [common.ChainId.avalanche]: [
    'https://raw.githubusercontent.com/pangolindex/tokenlists/main/pangolin.tokenlist.json',
    'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/mc.tokenlist.json',
    'https://tokens.coingecko.com/avalanche/all.json',
  ],
  [common.ChainId.fantom]: [
    'https://raw.githubusercontent.com/SpookySwap/spooky-info/master/src/constants/token/spookyswap.json',
    'https://tokens.coingecko.com/fantom/all.json',
  ],
};

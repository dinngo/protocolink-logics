import { TokenList } from '@uniswap/token-lists';
import { axios } from './http';
import * as common from '@protocolink/common';
import { ethers } from 'ethers';

export async function getUnifiedTokens(chainId: number, { isSkipNative = false } = {}) {
  const tokenList = Object.values(await common.getUnifiedTokens(chainId));
  return isSkipNative ? tokenList.filter((token) => !token.is(common.getNativeToken(chainId))) : tokenList;
}

export function getDefaultTokenListUrls(chainId: number) {
  switch (chainId) {
    case common.ChainId.mainnet:
      return [
        'https://raw.githubusercontent.com/paraswap/community-token-list/master/src/sources/paraswap.extralist.json',
        'https://wispy-bird-88a7.uniswap.workers.dev/?url=http://tokenlist.aave.eth.link',
        'https://gateway.ipfs.io/ipns/tokens.uniswap.org',
      ];
    case common.ChainId.optimism:
      return [
        'https://static.optimism.io/optimism.tokenlist.json',
        'https://tokens.coingecko.com/optimistic-ethereum/all.json',
      ];
    case common.ChainId.bnb:
      return ['https://tokens.pancakeswap.finance/pancakeswap-extended.json'];
    case common.ChainId.polygon:
      return [
        'https://unpkg.com/quickswap-default-token-list@1.2.74/build/quickswap-default.tokenlist.json',
        'https://unpkg.com/@cometh-game/default-token-list@1.0.40/build/comethswap-default.tokenlist.json',
        'https://tokens.coingecko.com/polygon-pos/all.json',
      ];
    case common.ChainId.base:
      return ['https://tokens.coingecko.com/base/all.json'];
    case common.ChainId.arbitrum:
      return [
        'https://raw.githubusercontent.com/paraswap/community-token-list/master/src/sources/paraswap.extralist.json',
        'https://tokenlist.arbitrum.io/ArbTokenLists/arbed_arb_whitelist_era.json',
        'https://tokens.coingecko.com/arbitrum-one/all.json',
      ];
    case common.ChainId.avalanche:
      return [
        'https://raw.githubusercontent.com/pangolindex/tokenlists/main/pangolin.tokenlist.json',
        'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/mc.tokenlist.json',
        'https://tokens.coingecko.com/avalanche/all.json',
      ];
    default:
      return [];
  }
}

export async function getTokenList(
  tokenListUrls: string[],
  chainIdInput: number,
  defaultTokenList: common.Token[] = []
) {
  const tokenLists: TokenList[] = [];
  await Promise.all(
    tokenListUrls.map(async (tokenListUrl) => {
      try {
        const resp = await axios.get(tokenListUrl);
        let data = resp.data;
        if ((resp.headers['content-type'] as string).includes('text/plain')) {
          data = JSON.parse(data);
        }
        tokenLists.push(data);
      } catch {}
    })
  );

  const tmp: Record<string, boolean> = defaultTokenList.reduce((acc, token) => ({ [token.address]: true }), {});
  const tokenList: common.Token[] = [...defaultTokenList];
  for (const { tokens } of tokenLists) {
    for (const { chainId, address, decimals, symbol, name, logoURI } of tokens) {
      const lowerCaseAddress = address.toLowerCase();

      if (
        tmp[lowerCaseAddress] ||
        chainId !== chainIdInput ||
        !name ||
        !symbol ||
        !decimals ||
        !ethers.utils.isAddress(address)
      )
        continue;
      tokenList.push(new common.Token(chainId, address, decimals, symbol, name, logoURI));
      tmp[lowerCaseAddress] = true;
    }
  }

  return tokenList;
}

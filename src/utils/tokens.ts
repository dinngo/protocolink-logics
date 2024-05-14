import { TokenList } from '@uniswap/token-lists';
import { axios } from './http';
import * as common from '@protocolink/common';
import { ethers } from 'ethers';

export async function get1InchTokens(chainId: number) {
  const { data } = await axios.get<Record<string, { symbol: string; name: string; decimals: number; address: string }>>(
    `https://tokens.1inch.io/v1.2/${chainId}`
  );

  const nativeToken = common.getNativeToken(chainId);
  const elasticAddress = common.ELASTIC_ADDRESS.toLowerCase();
  const tokens = Object.values(data).map(({ address, decimals, symbol, name }) =>
    address === elasticAddress ? nativeToken : new common.Token(chainId, address, decimals, symbol, name)
  );

  return tokens;
}

export async function getMetisTokens() {
  const chainId = common.ChainId.metis;
  const { data } = await axios.get<{ tokens: { symbol: string; name: string; decimals: number; address: string }[] }>(
    `https://tokens.coingecko.com/metis-andromeda/all.json`
  );

  const tokens = [common.getNativeToken(chainId)];
  for (const { address, decimals, symbol, name } of data.tokens) {
    tokens.push(new common.Token(chainId, address, decimals, symbol, name));
  }

  return tokens;
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
        const { data } = await axios.get<TokenList>(tokenListUrl);
        tokenLists.push(data);
      } catch {}
    })
  );

  const tmp: Record<string, boolean> = defaultTokenList.reduce((acc, token) => ({ [token.address]: true }), {});
  const tokenList: common.Token[] = [...defaultTokenList];
  for (const { tokens } of tokenLists) {
    for (const { chainId, address, decimals, symbol, name } of tokens) {
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
      tokenList.push(new common.Token(chainId, address, decimals, symbol, name));
      tmp[lowerCaseAddress] = true;
    }
  }

  return tokenList;
}

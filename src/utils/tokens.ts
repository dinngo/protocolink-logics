import { axios } from './http';
import * as common from '@protocolink/common';
import { goerliTokens } from 'src/logics/morphoblue';

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

export function getGoerliTokens() {
  const tokens = [goerliTokens.ETH, goerliTokens.WETH, goerliTokens.USDC, goerliTokens.DAI];

  return tokens;
}

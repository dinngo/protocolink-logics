import * as common from '@protocolink/common';
import { optimismTokens } from './tokens';

type ContractNames = 'Comptroller';

export interface Config {
  chainId: number;
  contract: Record<ContractNames, string>;
  assets: { underlyingToken: common.Token; cTokens: common.Token[] }[];
}

export const configs: Config[] = [
  {
    chainId: common.ChainId.optimism,
    contract: {
      Comptroller: '0x60CF091cD3f50420d50fD7f707414d0DF4751C58',
    },
    assets: [
      {
        underlyingToken: optimismTokens.OP,
        cTokens: [optimismTokens.soOP],
      },
      {
        underlyingToken: optimismTokens['USDC.e'],
        cTokens: [optimismTokens['soUSDC.e']],
      },
      {
        underlyingToken: optimismTokens.USDT,
        cTokens: [optimismTokens.soUSDT],
      },
      {
        underlyingToken: optimismTokens.DAI,
        cTokens: [optimismTokens.soDAI],
      },
      {
        underlyingToken: optimismTokens.sUSD,
        cTokens: [optimismTokens.soSUSD],
      },
      {
        underlyingToken: optimismTokens.WETH,
        cTokens: [optimismTokens.soWETH],
      },
      {
        underlyingToken: optimismTokens.SNX,
        cTokens: [optimismTokens.soSNX],
      },
      {
        underlyingToken: optimismTokens.WBTC,
        cTokens: [optimismTokens.soWBTC],
      },
      {
        underlyingToken: optimismTokens.LUSD,
        cTokens: [optimismTokens.soLUSD],
      },
      {
        underlyingToken: optimismTokens.wstETH,
        cTokens: [optimismTokens.sowstETH],
      },
      {
        underlyingToken: optimismTokens.MAI,
        cTokens: [optimismTokens.soMAI],
      },
      {
        underlyingToken: optimismTokens.USDC,
        cTokens: [optimismTokens.soUSDCnative],
      },
    ],
  },
];

export const [
  supportedChainIds,
  configMap,
  underlyingTokens,
  tokenPairs,
  underlyingToCTokenMap,
  cTokenToUnderlyingMap,
] = configs.reduce(
  (accumulator, config) => {
    accumulator[0].push(config.chainId);
    accumulator[1][config.chainId] = config;
    accumulator[2][config.chainId] = [];
    accumulator[3][config.chainId] = [];
    accumulator[4][config.chainId] = {};
    accumulator[5][config.chainId] = {};
    for (const asset of config.assets) {
      const underlyingToken = asset.underlyingToken;
      const cTokens = asset.cTokens;

      accumulator[2][config.chainId].push(underlyingToken);
      accumulator[3][config.chainId].push({ underlyingToken, cToken: cTokens[0] });
      accumulator[4][config.chainId][underlyingToken.address] = cTokens[0];

      for (const cToken of cTokens) {
        accumulator[5][config.chainId][cToken.address] = underlyingToken;
      }
    }

    return accumulator;
  },
  [[], {}, [], [], {}, {}] as [
    number[],
    Record<number, Config>,
    Record<number, common.Token[]>,
    Record<number, Array<{ underlyingToken: common.Token; cToken: common.Token }>>,
    Record<number, Record<string, common.Token>>,
    Record<number, Record<string, common.Token>>
  ]
);

export function getContractAddress(chainId: number, name: ContractNames) {
  return configMap[chainId].contract[name];
}

export function toCToken(chainId: number, underlyingTokenOrAddress: common.TokenOrAddress) {
  return underlyingToCTokenMap[chainId][common.Token.getAddress(underlyingTokenOrAddress)];
}

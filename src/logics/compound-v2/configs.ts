import * as common from '@protocolink/common';
import { mainnetTokens } from './tokens';

type ContractNames = 'Comptroller' | 'CompoundLens';

export interface Config {
  chainId: number;
  contract: Record<ContractNames, string>;
  COMP: common.Token;
  assets: { underlyingToken: common.Token; cTokens: common.Token[] }[];
}

export const config: Config = {
  chainId: common.ChainId.mainnet,
  contract: {
    Comptroller: '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B',
    CompoundLens: '0xdCbDb7306c6Ff46f77B349188dC18cEd9DF30299',
  },
  COMP: mainnetTokens.COMP,
  assets: [
    {
      underlyingToken: mainnetTokens.AAVE,
      cTokens: [mainnetTokens.cAAVE],
    },
    {
      underlyingToken: mainnetTokens.BAT,
      cTokens: [mainnetTokens.cBAT],
    },
    {
      underlyingToken: mainnetTokens.COMP,
      cTokens: [mainnetTokens.cCOMP],
    },
    {
      underlyingToken: mainnetTokens.DAI,
      cTokens: [mainnetTokens.cDAI],
    },
    {
      underlyingToken: mainnetTokens.ETH,
      cTokens: [mainnetTokens.cETH],
    },
    {
      underlyingToken: mainnetTokens.FEI,
      cTokens: [mainnetTokens.cFEI],
    },
    {
      underlyingToken: mainnetTokens.LINK,
      cTokens: [mainnetTokens.cLINK],
    },
    {
      underlyingToken: mainnetTokens.MKR,
      cTokens: [mainnetTokens.cMKR],
    },
    {
      underlyingToken: mainnetTokens.SUSHI,
      cTokens: [mainnetTokens.cSUSHI],
    },
    {
      underlyingToken: mainnetTokens.TUSD,
      cTokens: [mainnetTokens.cTUSD],
    },
    {
      underlyingToken: mainnetTokens.UNI,
      cTokens: [mainnetTokens.cUNI],
    },
    {
      underlyingToken: mainnetTokens.USDC,
      cTokens: [mainnetTokens.cUSDC],
    },
    {
      underlyingToken: mainnetTokens.USDP,
      cTokens: [mainnetTokens.cUSDP],
    },
    {
      underlyingToken: mainnetTokens.USDT,
      cTokens: [mainnetTokens.cUSDT],
    },
    {
      underlyingToken: mainnetTokens.WBTC,
      cTokens: [mainnetTokens.cWBTC2, mainnetTokens.cWBTC],
    },
    {
      underlyingToken: mainnetTokens.YFI,
      cTokens: [mainnetTokens.cYFI],
    },
    {
      underlyingToken: mainnetTokens.ZRX,
      cTokens: [mainnetTokens.cZRX],
    },
  ],
};

export const supportedChainIds = [config.chainId];

export const COMP = config.COMP;

export const [underlyingTokens, tokenPairs, underlyingToCTokenMap, cTokenToUnderlyingMap] = config.assets.reduce(
  (accumulator, { underlyingToken, cTokens }) => {
    accumulator[0].push(underlyingToken);
    accumulator[1].push({ underlyingToken, cToken: cTokens[0] });
    accumulator[2][underlyingToken.address] = cTokens[0];
    for (const cToken of cTokens) {
      accumulator[3][cToken.address] = underlyingToken;
    }

    return accumulator;
  },
  [
    [] as common.Token[],
    [] as Array<{ underlyingToken: common.Token; cToken: common.Token }>,
    {} as Record<string, common.Token>,
    {} as Record<string, common.Token>,
  ]
);

export function getContractAddress(name: ContractNames) {
  return config.contract[name];
}

export function toCToken(underlyingTokenOrAddress: common.TokenOrAddress) {
  return underlyingToCTokenMap[common.Token.getAddress(underlyingTokenOrAddress)];
}

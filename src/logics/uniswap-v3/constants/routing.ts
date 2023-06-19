import { Token, WETH9 } from '@uniswap/sdk-core';
import { WRAPPED_NATIVE_CURRENCY, arbitrumTokens, mainnetTokens, optimismTokens, polygonTokens } from './tokens';
import * as common from '@furucombo/composable-router-common';

type ChainTokenList = {
  readonly [chainId: number]: Token[];
};

// https://github.com/Uniswap/interface/blob/v4.204.5/src/constants/routing.ts#L61
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  [common.ChainId.mainnet]: [
    WRAPPED_NATIVE_CURRENCY[common.ChainId.mainnet],
    mainnetTokens.DAI,
    mainnetTokens.USDC,
    mainnetTokens.USDT,
    mainnetTokens.WBTC,
  ],
  [common.ChainId.optimism]: [
    WRAPPED_NATIVE_CURRENCY[common.ChainId.optimism],
    optimismTokens.DAI,
    optimismTokens.USDT,
    optimismTokens.WBTC,
  ],
  [common.ChainId.arbitrum]: [
    WRAPPED_NATIVE_CURRENCY[common.ChainId.arbitrum],
    arbitrumTokens.DAI,
    arbitrumTokens.USDT,
    arbitrumTokens.WBTC,
  ],
  [common.ChainId.polygon]: [
    WRAPPED_NATIVE_CURRENCY[common.ChainId.polygon],
    polygonTokens.DAI,
    polygonTokens.USDC,
    polygonTokens.USDT,
    polygonTokens.WETH,
  ],
};

// https://github.com/Uniswap/interface/blob/v4.204.5/src/constants/routing.ts#L91
export const ADDITIONAL_BASES: { [chainId: number]: { [tokenAddress: string]: Token[] } } = {
  [common.ChainId.mainnet]: {
    '0xF16E4d813f4DcfDe4c5b44f305c908742De84eF0': [mainnetTokens.ETH2X_FLI],
    [mainnetTokens.rETH2.address]: [mainnetTokens.sETH2],
    [mainnetTokens.SWISE.address]: [mainnetTokens.sETH2],
    [mainnetTokens.FEI.address]: [mainnetTokens.TRIBE],
    [mainnetTokens.TRIBE.address]: [mainnetTokens.FEI],
    [mainnetTokens.FRAX.address]: [mainnetTokens.FXS],
    [mainnetTokens.FXS.address]: [mainnetTokens.FRAX],
    [mainnetTokens.WBTC.address]: [mainnetTokens.renBTC],
    [mainnetTokens.renBTC.address]: [mainnetTokens.WBTC],
  },
};

// https://github.com/Uniswap/interface/blob/v4.204.5/src/constants/routing.ts#L108
export const CUSTOM_BASES: { [chainId: number]: { [tokenAddress: string]: Token[] } } = {
  [common.ChainId.mainnet]: { [mainnetTokens.AMPL.address]: [mainnetTokens.DAI, WETH9[1]] },
};

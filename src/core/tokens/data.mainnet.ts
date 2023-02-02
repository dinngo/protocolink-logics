import { Token } from './token';

export const ETH_MAINNET = new Token(1, '0x0000000000000000000000000000000000000000', 18, 'ETH', 'Ethereum');
export const WETH_MAINNET = new Token(1, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18, 'WETH', 'Wrapped Ether');
export const DAI_MAINNET = new Token(1, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'Dai Stablecoin');
export const USDC_MAINNET = new Token(1, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD Coin');
export const USDT_MAINNET = new Token(1, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'Tether USD');
export const WBTC_MAINNET = new Token(1, '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 8, 'WBTC', 'Wrapped BTC');

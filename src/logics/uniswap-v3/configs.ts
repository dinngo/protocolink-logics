import { FeeAmount } from '@uniswap/v3-sdk';
import { arbitrumTokens, mainnetTokens, optimismTokens, polygonTokens } from './tokens';
import * as common from '@protocolink/common';
import * as univ3 from 'src/modules/univ3';

// https://github.com/Uniswap/interface/blob/v4.204.5/src/constants/routing.ts#L61
// https://github.com/Uniswap/interface/blob/v4.204.5/src/constants/routing.ts#L91
// https://github.com/Uniswap/interface/blob/v4.204.5/src/constants/routing.ts#L108
export const configs: univ3.Config[] = [
  {
    chainId: common.ChainId.mainnet,
    factoryAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    quoter: { address: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e', isV2: true },
    swapRouterAddress: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    feeAmounts: [FeeAmount.LOWEST, FeeAmount.LOW, FeeAmount.MEDIUM, FeeAmount.HIGH],
    bases: [mainnetTokens.WETH, mainnetTokens.DAI, mainnetTokens.USDC, mainnetTokens.USDT, mainnetTokens.WBTC],
    additionalBases: {
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
  },
  {
    chainId: common.ChainId.polygon,
    factoryAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    quoter: { address: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e', isV2: true },
    swapRouterAddress: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    feeAmounts: [FeeAmount.LOWEST, FeeAmount.LOW, FeeAmount.MEDIUM, FeeAmount.HIGH],
    bases: [
      polygonTokens.WMATIC,
      polygonTokens.DAI,
      polygonTokens.USDC,
      polygonTokens.USDT,
      polygonTokens.WETH,
      polygonTokens.WBTC,
    ],
  },
  {
    chainId: common.ChainId.arbitrum,
    factoryAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    quoter: { address: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e', isV2: true },
    swapRouterAddress: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    feeAmounts: [FeeAmount.LOWEST, FeeAmount.LOW, FeeAmount.MEDIUM, FeeAmount.HIGH],
    bases: [
      arbitrumTokens.WETH,
      arbitrumTokens.DAI,
      arbitrumTokens.USDT,
      arbitrumTokens.WBTC,
      arbitrumTokens.USDC,
      arbitrumTokens['USDC.e'],
    ],
  },
  {
    chainId: common.ChainId.optimism,
    factoryAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    quoter: { address: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e', isV2: true },
    swapRouterAddress: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    feeAmounts: [FeeAmount.LOWEST, FeeAmount.LOW, FeeAmount.MEDIUM, FeeAmount.HIGH],
    bases: [optimismTokens.WETH, optimismTokens.DAI, optimismTokens.USDT, optimismTokens.WBTC, optimismTokens.USDC],
  },
];

export const [supportedChainIds, configMap] = configs.reduce(
  (accumulator, config) => {
    accumulator[0].push(config.chainId);
    accumulator[1][config.chainId] = config;
    return accumulator;
  },
  [[], {}] as [number[], Record<number, univ3.Config>]
);

export function getConfig(chainId: number) {
  return configMap[chainId];
}

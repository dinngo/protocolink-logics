import { FeeAmount } from '@uniswap/v3-sdk';
import { arbitrumTokens, avalancheTokens, baseTokens, mainnetTokens, optimismTokens, polygonTokens } from './tokens';
import * as common from '@protocolink/common';
import * as univ3 from 'src/modules/univ3';

// https://github.com/Uniswap/interface/blob/v4.265.0/src/constants/routing.ts#L65
// https://github.com/Uniswap/interface/blob/v4.204.5/src/constants/routing.ts#L91
// https://github.com/Uniswap/interface/blob/v4.204.5/src/constants/routing.ts#L108
export const configs: univ3.Config[] = [
  {
    chainId: common.ChainId.mainnet,
    factoryAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    quoter: { address: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e', isV2: true },
    swapRouterAddress: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45', // swapRouter02
    feeAmounts: [FeeAmount.LOWEST, FeeAmount.LOW, FeeAmount.MEDIUM, FeeAmount.HIGH],
    bases: [mainnetTokens.DAI, mainnetTokens.USDC, mainnetTokens.USDT, mainnetTokens.WBTC, mainnetTokens.WETH],
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
    chainId: common.ChainId.optimism,
    factoryAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    quoter: { address: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e', isV2: true },
    swapRouterAddress: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45', // swapRouter02
    feeAmounts: [FeeAmount.LOWEST, FeeAmount.LOW, FeeAmount.MEDIUM, FeeAmount.HIGH],
    bases: [optimismTokens.OP, optimismTokens.DAI, optimismTokens['USDC.e'], optimismTokens.USDT, optimismTokens.WBTC],
  },
  {
    chainId: common.ChainId.polygon,
    factoryAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    quoter: { address: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e', isV2: true },
    swapRouterAddress: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45', // swapRouter02
    feeAmounts: [FeeAmount.LOWEST, FeeAmount.LOW, FeeAmount.MEDIUM, FeeAmount.HIGH],
    bases: [polygonTokens.WETH, polygonTokens.USDC, polygonTokens.DAI, polygonTokens.USDT, polygonTokens.WBTC],
  },
  {
    chainId: common.ChainId.base,
    factoryAddress: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD',
    quoter: { address: '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a', isV2: true },
    swapRouterAddress: '0x2626664c2603336E57B271c5C0b26F421741e481', // swapRouter02
    feeAmounts: [FeeAmount.LOWEST, FeeAmount.LOW, FeeAmount.MEDIUM, FeeAmount.HIGH],
    bases: [baseTokens.USDbC, baseTokens.WETH],
  },
  {
    chainId: common.ChainId.arbitrum,
    factoryAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    quoter: { address: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e', isV2: true },
    swapRouterAddress: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45', // swapRouter02
    feeAmounts: [FeeAmount.LOWEST, FeeAmount.LOW, FeeAmount.MEDIUM, FeeAmount.HIGH],
    bases: [
      arbitrumTokens.ARB,
      arbitrumTokens.DAI,
      arbitrumTokens.USDC,
      arbitrumTokens.USDT,
      arbitrumTokens.WBTC,
      arbitrumTokens.WETH,
    ],
  },
  {
    chainId: common.ChainId.avalanche,
    factoryAddress: '0x740b1c1de25031C31FF4fC9A62f554A55cdC1baD',
    quoter: { address: '0xbe0F5544EC67e9B3b2D979aaA43f18Fd87E6257F', isV2: true },
    swapRouterAddress: '0xbb00FF08d01D300023C629E8fFfFcb65A5a578cE', // swapRouter02
    feeAmounts: [FeeAmount.LOWEST, FeeAmount.LOW, FeeAmount.MEDIUM, FeeAmount.HIGH],
    bases: [
      avalancheTokens.WAVAX,
      avalancheTokens['DAI.e'],
      avalancheTokens.USDC,
      avalancheTokens.USDt,
      avalancheTokens['WETH.e'],
    ],
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

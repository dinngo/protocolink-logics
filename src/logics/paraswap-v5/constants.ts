// https://github.com/paraswap/paraswap-core/blob/master/src/constants.ts

export enum SwapSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum ContractMethod {
  swapOnUniswap = 'swapOnUniswap',
  buyOnUniswap = 'buyOnUniswap',
  swapOnUniswapFork = 'swapOnUniswapFork',
  buyOnUniswapFork = 'buyOnUniswapFork',
  swapOnUniswapV2Fork = 'swapOnUniswapV2Fork',
  buyOnUniswapV2Fork = 'buyOnUniswapV2Fork',
  simpleBuy = 'simpleBuy',
  simpleSwap = 'simpleSwap',
  multiSwap = 'multiSwap',
  megaSwap = 'megaSwap',
  protectedMultiSwap = 'protectedMultiSwap',
  protectedMegaSwap = 'protectedMegaSwap',
  protectedSimpleSwap = 'protectedSimpleSwap',
  protectedSimpleBuy = 'protectedSimpleBuy',
  swapOnZeroXv2 = 'swapOnZeroXv2',
  swapOnZeroXv4 = 'swapOnZeroXv4',
  buy = 'buy', // TODO: remove this in future

  directUniV3Swap = 'directUniV3Swap',
  directUniV3Buy = 'directUniV3Buy',
  directCurveV1Swap = 'directCurveV1Swap',
  directCurveV2Swap = 'directCurveV2Swap',
  directBalancerV2GivenInSwap = 'directBalancerV2GivenInSwap',
  directBalancerV2GivenOutSwap = 'directBalancerV2GivenOutSwap',
}

export const DirectContractMethodsWithFeeModel: ContractMethod[] = [
  ContractMethod.directUniV3Swap,
  ContractMethod.directUniV3Buy,
  ContractMethod.directCurveV1Swap,
  ContractMethod.directCurveV2Swap,
  ContractMethod.directBalancerV2GivenInSwap,
  ContractMethod.directBalancerV2GivenOutSwap,
];

export const DirectContractMethods: ContractMethod[] = [
  ContractMethod.swapOnUniswap,
  ContractMethod.buyOnUniswap,
  ContractMethod.swapOnUniswapFork,
  ContractMethod.buyOnUniswapFork,
  ContractMethod.swapOnUniswapV2Fork,
  ContractMethod.buyOnUniswapV2Fork,
  ContractMethod.swapOnZeroXv2,
  ContractMethod.swapOnZeroXv4,
].concat(DirectContractMethodsWithFeeModel);

import { FeeAmount } from '@uniswap/v3-sdk';
import * as common from '@protocolink/common';
import { iotaTokens } from './tokens';
import * as univ3 from 'src/modules/univ3';

export const configs: univ3.Config[] = [
  {
    chainId: common.ChainId.iota,
    factoryAddress: '0x01Bd510B2eA106917e711f9a05a42fC162bee2Ac',
    quoter: { address: '0x5C08A6762CAF9ec8a42F249eBC23aAE66097218D', isV2: true },
    swapRouterAddress: '0xaE7b92C8B14E7bdB523408aE0A6fFbf3f589adD9', // swapRouter02
    feeAmounts: [FeeAmount.LOWEST - 100, FeeAmount.LOW, FeeAmount.LOW + 1000, FeeAmount.MEDIUM, FeeAmount.HIGH],
    bases: [iotaTokens.wIOTA, iotaTokens.USDT, iotaTokens.WETH],
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

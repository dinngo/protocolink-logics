import * as common from '@protocolink/common';
import { zksyncTokens } from './tokens';

export type ContractNames = 'PoolMaster' | 'ClassicPoolFactory' | 'StablePoolFactory' | 'Router' | 'RouteHelper';

export interface Config {
  chainId: number;
  contract: Record<ContractNames, string>;
  baseTokenAddresses: string[];
  tokens: common.Token[];
}

export const configs: Config[] = [
  {
    chainId: common.ChainId.zksync,
    contract: {
      PoolMaster: '0xbB05918E9B4bA9Fe2c8384d223f0844867909Ffb',
      ClassicPoolFactory: '0xf2DAd89f2788a8CD54625C60b55cD3d2D0ACa7Cb',
      StablePoolFactory: '0x5b9f21d407F35b10CbfDDca17D5D84b129356ea3',
      Router: '0x2da10A1e27bF85cEdD8FFb1AbBe97e53391C0295',
      RouteHelper: '0x5C07E74cB541c3D1875AEEE441D691DED6ebA204',
    },
    baseTokenAddresses: [zksyncTokens.WETH.address, zksyncTokens.USDC.address],
    tokens: Object.values(zksyncTokens),
  },
];

export const [supportedChainIds, configMap, tokenMap] = configs.reduce(
  (accumulator, config) => {
    accumulator[0].push(config.chainId);
    accumulator[1][config.chainId] = config;
    accumulator[2][config.chainId] = {};
    for (const token of config.tokens) {
      accumulator[2][config.chainId][token.address] = token;
    }

    return accumulator;
  },
  [[], {}, {}] as [number[], Record<number, Config>, Record<number, Record<string, common.Token>>]
);

export function getConfig(chainId: number) {
  return configMap[chainId];
}

export function getContractAddress(chainId: number, name: ContractNames) {
  return getConfig(chainId).contract[name];
}

export function getToken(chainId: number, address: string) {
  return tokenMap[chainId][address];
}

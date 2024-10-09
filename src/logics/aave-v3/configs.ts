import * as common from '@protocolink/common';

export const protocolId = 'aave-v3';

type ContractNames = 'PoolDataProvider' | 'AaveV3FlashLoanCallback';

export interface Config {
  chainId: number;
  contract: Record<ContractNames, string>;
}

export const configs: Config[] = [
  {
    chainId: common.ChainId.mainnet,
    contract: {
      PoolDataProvider: '0x41393e5e337606dc3821075Af65AeE84D7688CBD',
      AaveV3FlashLoanCallback: '0x6f81cf774052D03873b32944a036BF0647bFB5bF',
    },
  },
  {
    chainId: common.ChainId.optimism,
    contract: {
      PoolDataProvider: '0x7F23D86Ee20D869112572136221e173428DD740B',
      AaveV3FlashLoanCallback: '0x6f81cf774052D03873b32944a036BF0647bFB5bF',
    },
  },
  {
    chainId: common.ChainId.gnosis,
    contract: {
      PoolDataProvider: '0x57038C3e3Fe0a170BB72DE2fD56E98e4d1a69717',
      AaveV3FlashLoanCallback: '0x6f81cf774052D03873b32944a036BF0647bFB5bF',
    },
  },
  {
    chainId: common.ChainId.polygon,
    contract: {
      PoolDataProvider: '0x7F23D86Ee20D869112572136221e173428DD740B',
      AaveV3FlashLoanCallback: '0x6f81cf774052D03873b32944a036BF0647bFB5bF',
    },
  },
  {
    chainId: common.ChainId.metis,
    contract: {
      PoolDataProvider: '0xC01372469A17b6716A38F00c277533917B6859c0',
      AaveV3FlashLoanCallback: '0x6f81cf774052D03873b32944a036BF0647bFB5bF',
    },
  },
  {
    chainId: common.ChainId.base,
    contract: {
      PoolDataProvider: '0xd82a47fdebB5bf5329b09441C3DaB4b5df2153Ad',
      AaveV3FlashLoanCallback: '0x6f81cf774052D03873b32944a036BF0647bFB5bF',
    },
  },
  {
    chainId: common.ChainId.arbitrum,
    contract: {
      PoolDataProvider: '0x7F23D86Ee20D869112572136221e173428DD740B',
      AaveV3FlashLoanCallback: '0x6f81cf774052D03873b32944a036BF0647bFB5bF',
    },
  },
  {
    chainId: common.ChainId.avalanche,
    contract: {
      PoolDataProvider: '0x7F23D86Ee20D869112572136221e173428DD740B',
      AaveV3FlashLoanCallback: '0x6f81cf774052D03873b32944a036BF0647bFB5bF',
    },
  },
];

export const [supportedChainIds, configMap] = configs.reduce(
  (accumulator, config) => {
    accumulator[0].push(config.chainId);
    accumulator[1][config.chainId] = config;
    return accumulator;
  },
  [[], {}] as [number[], Record<number, Config>]
);

export function getContractAddress(chainId: number, name: ContractNames) {
  return configMap[chainId].contract[name];
}

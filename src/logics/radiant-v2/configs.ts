import * as common from '@protocolink/common';

export const protocolId = 'radiant-v2';

type ContractNames = 'ProtocolDataProvider' | 'RadiantV2FlashLoanCallback' | 'LendingPool';

export interface Config {
  chainId: number;
  contract: Record<ContractNames, string>;
}

export const configs: Config[] = [
  {
    chainId: common.ChainId.mainnet,
    contract: {
      ProtocolDataProvider: '0x362f3BB63Cff83bd169aE1793979E9e537993813',
      RadiantV2FlashLoanCallback: '0x6bfCE075A1c4F0fD4067A401dA8f159354e1a916',
      LendingPool: '0xA950974f64aA33f27F6C5e017eEE93BF7588ED07',
    },
  },
  {
    chainId: common.ChainId.bnb,
    contract: {
      ProtocolDataProvider: '0x2f9D57E97C3DFED8676e605BC504a48E0c5917E9',
      RadiantV2FlashLoanCallback: '0x544921763C3D2C9345BA3862eFa72368a12bBd1f',
      LendingPool: '0xCcf31D54C3A94f67b8cEFF8DD771DE5846dA032c',
    },
  },
  {
    chainId: common.ChainId.base,
    contract: {
      ProtocolDataProvider: '0x07d2DC09A1CbDD01e5f6Ca984b060A3Ff31b9EAF',
      RadiantV2FlashLoanCallback: '0x6bfCE075A1c4F0fD4067A401dA8f159354e1a916',
      LendingPool: '0x30798cFe2CCa822321ceed7e6085e633aAbC492F',
    },
  },
  {
    chainId: common.ChainId.arbitrum,
    contract: {
      ProtocolDataProvider: '0x596B0cc4c5094507C50b579a662FE7e7b094A2cC',
      RadiantV2FlashLoanCallback: '0x544921763C3D2C9345BA3862eFa72368a12bBd1f',
      LendingPool: '0xE23B4AE3624fB6f7cDEF29bC8EAD912f1Ede6886',
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

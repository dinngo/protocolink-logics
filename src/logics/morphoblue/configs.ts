import * as common from '@protocolink/common';
import { goerliTokens, mainnetTokens } from './tokens';

type ContractNames = 'Morpho' | 'MorphoFlashLoanCallback';

export interface MarketConfig {
  id: string;
  loanTokenAddress: string;
  collateralTokenAddress: string;
  oracle: string;
  irm: string;
  lltv: string;
}

export interface Config {
  chainId: number;
  contract: Record<ContractNames, string>;
  markets: MarketConfig[];
}

export const configs: Config[] = [
  {
    chainId: common.ChainId.mainnet,
    contract: {
      Morpho: '0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb',
      MorphoFlashLoanCallback: '0x24D5b6b712D1f0D0B628E21E39dBaDde3f28C56e',
    },
    // get meta morpho addresses from MetaMorphoFactory CreateMetaMorpho events
    // get market ids from meta morpho supply/withdraw queues
    // zero oracle address is excluded
    markets: [
      {
        id: '0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41',
        loanTokenAddress: mainnetTokens.WETH.address,
        collateralTokenAddress: mainnetTokens.wstETH.address,
        oracle: '0x2a01EB9496094dA03c4E364Def50f5aD1280AD72',
        irm: '0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC',
        lltv: '945000000000000000',
      },
      {
        id: '0xb323495f7e4148be5643a4ea4a8221eef163e4bccfdedc2a6f4696baacbc86cc',
        loanTokenAddress: mainnetTokens.USDC.address,
        collateralTokenAddress: mainnetTokens.wstETH.address,
        oracle: '0x48F7E36EB6B826B2dF4B2E630B62Cd25e89E40e2',
        irm: '0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC',
        lltv: '860000000000000000',
      },
    ],
  },
  {
    chainId: common.ChainId.goerli,
    contract: {
      Morpho: '0x64c7044050Ba0431252df24fEd4d9635a275CB41',
      MorphoFlashLoanCallback: '0x24D5b6b712D1f0D0B628E21E39dBaDde3f28C56e',
    },
    markets: [
      {
        id: '0x3098a46de09dd8d9a8c6fa1ab7b3f943b6f13e5ea72a4e475d9e48f222bfd5a0',
        loanTokenAddress: goerliTokens.WETH.address,
        collateralTokenAddress: goerliTokens.DAI.address,
        oracle: '0x2bCd59a5fc4Eb21eD6c906702E471922fABbe9a9',
        irm: '0x9ee101eB4941d8D7A665fe71449360CEF3C8Bb87',
        lltv: '900000000000000000', // 90%
      },
      {
        id: '0x900d90c624f9bd1e1143059c14610bde45ff7d1746c52bf6c094d3568285b661',
        loanTokenAddress: goerliTokens.WETH.address,
        collateralTokenAddress: goerliTokens.USDC.address,
        oracle: '0xC801d09b2314D85dE751D03497E7a7482c91e4FB',
        irm: '0x9ee101eB4941d8D7A665fe71449360CEF3C8Bb87',
        lltv: '900000000000000000',
      },
      {
        id: '0x98ee9f294c961a5dbb9073c0fd2c2a6a66468f911e49baa935c0eab364499dbd',
        loanTokenAddress: goerliTokens.USDC.address,
        collateralTokenAddress: goerliTokens.WETH.address,
        oracle: '0x056F40626913837Ea575a495B5477D4EAbc6FC28',
        irm: '0x9ee101eB4941d8D7A665fe71449360CEF3C8Bb87',
        lltv: '900000000000000000',
      },
    ],
  },
];

export const [supportedChainIds, configMap, marketMap] = configs.reduce(
  (accumulator, config) => {
    accumulator[0].push(config.chainId);
    accumulator[1][config.chainId] = config;
    accumulator[2][config.chainId] = {};
    for (const market of config.markets) {
      accumulator[2][config.chainId][market.id] = market;
    }
    return accumulator;
  },
  [[], {}, {}] as [number[], Record<number, Config>, Record<number, Record<string, MarketConfig>>]
);

export function getContractAddress(chainId: number, name: ContractNames) {
  return configMap[chainId].contract[name];
}

export function getMarkets(chainId: number) {
  return configMap[chainId].markets;
}

export function getMarket(chainId: number, id: string) {
  return marketMap[chainId][id];
}

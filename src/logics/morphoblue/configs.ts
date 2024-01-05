import * as common from '@protocolink/common';
import { goerliTokens } from './tokens';

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
        lltv: '900000000000000000', // 90%
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

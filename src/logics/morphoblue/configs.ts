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
      {
        id: '0xa921ef34e2fc7a27ccc50ae7e4b154e16c9799d3387076c421423ef52ac4df99',
        loanTokenAddress: mainnetTokens.USDT.address,
        collateralTokenAddress: mainnetTokens.WBTC.address,
        oracle: '0x008bF4B1cDA0cc9f0e882E0697f036667652E1ef',
        irm: '0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC',
        lltv: '860000000000000000',
      },
      {
        id: '0x698fe98247a40c5771537b5786b2f3f9d78eb487b4ce4d75533cd0e94d88a115',
        loanTokenAddress: mainnetTokens.WETH.address,
        collateralTokenAddress: mainnetTokens.weETH.address,
        oracle: '0x3fa58b74e9a8eA8768eb33c8453e9C2Ed089A40a',
        irm: '0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC',
        lltv: '860000000000000000',
      },
      {
        id: '0x3a85e619751152991742810df6ec69ce473daef99e28a64ab2340d7b7ccfee49',
        loanTokenAddress: mainnetTokens.USDC.address,
        collateralTokenAddress: mainnetTokens.WBTC.address,
        oracle: '0xDddd770BADd886dF3864029e4B377B5F6a2B6b83',
        irm: '0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC',
        lltv: '860000000000000000',
      },
      {
        id: '0xd5211d0e3f4a30d5c98653d988585792bb7812221f04801be73a44ceecb11e89',
        loanTokenAddress: mainnetTokens.WETH.address,
        collateralTokenAddress: mainnetTokens.osETH.address,
        oracle: '0x224F2F1333b45E34fFCfC3bD01cE43C73A914498',
        irm: '0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC',
        lltv: '860000000000000000',
      },
      {
        id: '0xe7e9694b754c4d4f7e21faf7223f6fa71abaeb10296a4c43a54a7977149687d2',
        loanTokenAddress: mainnetTokens.USDT.address,
        collateralTokenAddress: mainnetTokens.wstETH.address,
        oracle: '0x95DB30fAb9A3754e42423000DF27732CB2396992',
        irm: '0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC',
        lltv: '860000000000000000',
      },
      {
        id: '0x124ddf1fa02a94085d1fcc35c46c7e180ddb8a0d3ec1181cf67a75341501c9e6',
        loanTokenAddress: mainnetTokens.PYUSD.address,
        collateralTokenAddress: mainnetTokens.wstETH.address,
        oracle: '0x27679a17b7419fB10Bd9D143f21407760fdA5C53',
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
        lltv: '900000000000000000',
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

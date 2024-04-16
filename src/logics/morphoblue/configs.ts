import * as common from '@protocolink/common';
import { mainnetTokens } from './tokens';

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
      {
        id: '0x49bb2d114be9041a787432952927f6f144f05ad3e83196a7d062f374ee11d0ee',
        loanTokenAddress: mainnetTokens.WETH.address,
        collateralTokenAddress: mainnetTokens.ezETH.address,
        oracle: '0x61025e2B0122ac8bE4e37365A4003d87ad888Cc3',
        irm: '0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC',
        lltv: '860000000000000000',
      },
      {
        id: '0x1929f8139224cb7d5db8c270addc9ce366d37ad279e1135f73c0adce74b0f936',
        loanTokenAddress: mainnetTokens.WETH.address,
        collateralTokenAddress: mainnetTokens.sDAI.address,
        oracle: '0x0f9bb760D76af1B5Ca89102084E1963F6698AFda',
        irm: '0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC',
        lltv: '860000000000000000',
      },
      {
        id: '0x1247f1c237eceae0602eab1470a5061a6dd8f734ba88c7cdc5d6109fb0026b28',
        loanTokenAddress: mainnetTokens.DAI.address,
        collateralTokenAddress: mainnetTokens.sUSDe.address,
        oracle: '0x5D916980D5Ae1737a8330Bf24dF812b2911Aae25',
        irm: '0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC',
        lltv: '915000000000000000',
      },
      {
        id: '0x8bbd1763671eb82a75d5f7ca33a0023ffabdd9d1a3d4316f34753685ae988e80',
        loanTokenAddress: mainnetTokens.WETH.address,
        collateralTokenAddress: mainnetTokens.apxETH.address,
        oracle: '0x037D67A5E6F19d0Fb26A6603d2D4fE9d70eC3258',
        irm: '0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC',
        lltv: '860000000000000000',
      },
      {
        id: '0x8e6aeb10c401de3279ac79b4b2ea15fc94b7d9cfc098d6c2a1ff7b2b26d9d02c',
        loanTokenAddress: mainnetTokens.DAI.address,
        collateralTokenAddress: mainnetTokens.USDe.address,
        oracle: '0xaE4750d0813B5E37A51f7629beedd72AF1f9cA35',
        irm: '0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC',
        lltv: '915000000000000000',
      },
      {
        id: '0x97bb820669a19ba5fa6de964a466292edd67957849f9631eb8b830c382f58b7f',
        loanTokenAddress: mainnetTokens.USDC.address,
        collateralTokenAddress: mainnetTokens.MKR.address,
        oracle: '0x6686788B4315A4F93d822c1Bf73910556FCe2d5a',
        irm: '0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC',
        lltv: '770000000000000000',
      },
      {
        id: '0xdc5333039bcf15f1237133f74d5806675d83d9cf19cfd4cfdd9be674842651bf',
        loanTokenAddress: mainnetTokens.USDT.address,
        collateralTokenAddress: mainnetTokens.sUSDe.address,
        oracle: '0xE47E36457D0cF83A74AE1e45382B7A044f7abd99',
        irm: '0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC',
        lltv: '915000000000000000',
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

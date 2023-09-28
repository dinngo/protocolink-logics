import * as common from '@protocolink/common';

type ContractNames = 'Comptroller' | 'CompoundLens';

export interface Config {
  chainId: number;
  contract: Record<ContractNames, string>;
  COMP: common.Token;
  assets: { underlyingToken: common.Token; cTokens: common.Token[] }[];
}

export const config: Config = {
  chainId: common.ChainId.mainnet,
  contract: {
    Comptroller: '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B',
    CompoundLens: '0xdCbDb7306c6Ff46f77B349188dC18cEd9DF30299',
  },
  COMP: new common.Token(common.ChainId.mainnet, '0xc00e94Cb662C3520282E6f5717214004A7f26888', 18, 'COMP', 'Compound'),
  assets: [
    {
      underlyingToken: new common.Token(
        common.ChainId.mainnet,
        '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
        18,
        'AAVE',
        'Aave Token'
      ),
      cTokens: [
        new common.Token(
          common.ChainId.mainnet,
          '0xe65cdB6479BaC1e22340E4E755fAE7E509EcD06c',
          8,
          'cAAVE',
          'Compound Aave Token'
        ),
      ],
    },
    {
      underlyingToken: new common.Token(
        common.ChainId.mainnet,
        '0x0D8775F648430679A709E98d2b0Cb6250d2887EF',
        18,
        'BAT',
        'Basic Attention Token'
      ),
      cTokens: [
        new common.Token(
          common.ChainId.mainnet,
          '0x6C8c6b02E7b2BE14d4fA6022Dfd6d75921D90E4E',
          8,
          'cBAT',
          'Compound Basic Attention Token'
        ),
      ],
    },
    {
      underlyingToken: new common.Token(
        common.ChainId.mainnet,
        '0xc00e94Cb662C3520282E6f5717214004A7f26888',
        18,
        'COMP',
        'Compound'
      ),
      cTokens: [
        new common.Token(
          common.ChainId.mainnet,
          '0x70e36f6BF80a52b3B46b3aF8e106CC0ed743E8e4',
          8,
          'cCOMP',
          'Compound Collateral'
        ),
      ],
    },
    {
      underlyingToken: new common.Token(
        common.ChainId.mainnet,
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        18,
        'DAI',
        'Dai Stablecoin'
      ),
      cTokens: [
        new common.Token(
          common.ChainId.mainnet,
          '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
          8,
          'cDAI',
          'Compound Dai'
        ),
      ],
    },
    {
      underlyingToken: new common.Token(
        common.ChainId.mainnet,
        '0x0000000000000000000000000000000000000000',
        18,
        'ETH',
        'Ethereum'
      ),
      cTokens: [
        new common.Token(
          common.ChainId.mainnet,
          '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5',
          8,
          'cETH',
          'Compound Ether'
        ),
      ],
    },
    {
      underlyingToken: new common.Token(
        common.ChainId.mainnet,
        '0x956F47F50A910163D8BF957Cf5846D573E7f87CA',
        18,
        'FEI',
        'Fei USD'
      ),
      cTokens: [
        new common.Token(
          common.ChainId.mainnet,
          '0x7713DD9Ca933848F6819F38B8352D9A15EA73F67',
          8,
          'cFEI',
          'Compound Fei USD'
        ),
      ],
    },
    {
      underlyingToken: new common.Token(
        common.ChainId.mainnet,
        '0x514910771AF9Ca656af840dff83E8264EcF986CA',
        18,
        'LINK',
        'ChainLink Token'
      ),
      cTokens: [
        new common.Token(
          common.ChainId.mainnet,
          '0xFAce851a4921ce59e912d19329929CE6da6EB0c7',
          8,
          'cLINK',
          'Compound ChainLink Token'
        ),
      ],
    },
    {
      underlyingToken: new common.Token(
        common.ChainId.mainnet,
        '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
        18,
        'MKR',
        'Maker'
      ),
      cTokens: [
        new common.Token(
          common.ChainId.mainnet,
          '0x95b4eF2869eBD94BEb4eEE400a99824BF5DC325b',
          8,
          'cMKR',
          'Compound Maker'
        ),
      ],
    },
    {
      underlyingToken: new common.Token(
        common.ChainId.mainnet,
        '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2',
        18,
        'SUSHI',
        'SushiToken'
      ),
      cTokens: [
        new common.Token(
          common.ChainId.mainnet,
          '0x4B0181102A0112A2ef11AbEE5563bb4a3176c9d7',
          8,
          'cSUSHI',
          'Compound Sushi Token'
        ),
      ],
    },
    {
      underlyingToken: new common.Token(
        common.ChainId.mainnet,
        '0x0000000000085d4780B73119b644AE5ecd22b376',
        18,
        'TUSD',
        'TrueUSD'
      ),
      cTokens: [
        new common.Token(
          common.ChainId.mainnet,
          '0x12392F67bdf24faE0AF363c24aC620a2f67DAd86',
          8,
          'cTUSD',
          'Compound TrueUSD'
        ),
      ],
    },
    {
      underlyingToken: new common.Token(
        common.ChainId.mainnet,
        '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
        18,
        'UNI',
        'Uniswap'
      ),
      cTokens: [
        new common.Token(
          common.ChainId.mainnet,
          '0x35A18000230DA775CAc24873d00Ff85BccdeD550',
          8,
          'cUNI',
          'Compound Uniswap'
        ),
      ],
    },
    {
      underlyingToken: new common.Token(
        common.ChainId.mainnet,
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        6,
        'USDC',
        'USD Coin'
      ),
      cTokens: [
        new common.Token(
          common.ChainId.mainnet,
          '0x39AA39c021dfbaE8faC545936693aC917d5E7563',
          8,
          'cUSDC',
          'Compound USD Coin'
        ),
      ],
    },
    {
      underlyingToken: new common.Token(
        common.ChainId.mainnet,
        '0x8E870D67F660D95d5be530380D0eC0bd388289E1',
        18,
        'USDP',
        'Pax Dollar'
      ),
      cTokens: [
        new common.Token(
          common.ChainId.mainnet,
          '0x041171993284df560249B57358F931D9eB7b925D',
          8,
          'cUSDP',
          'Compound Pax Dollar'
        ),
      ],
    },
    {
      underlyingToken: new common.Token(
        common.ChainId.mainnet,
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        6,
        'USDT',
        'Tether USD'
      ),
      cTokens: [
        new common.Token(
          common.ChainId.mainnet,
          '0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9',
          8,
          'cUSDT',
          'Compound USDT'
        ),
      ],
    },
    {
      underlyingToken: new common.Token(
        common.ChainId.mainnet,
        '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        8,
        'WBTC',
        'Wrapped BTC'
      ),
      cTokens: [
        new common.Token(
          common.ChainId.mainnet,
          '0xccF4429DB6322D5C611ee964527D42E5d685DD6a',
          8,
          'cWBTC',
          'Compound Wrapped BTC'
        ),
        new common.Token(
          common.ChainId.mainnet,
          '0xC11b1268C1A384e55C48c2391d8d480264A3A7F4',
          8,
          'cWBTC',
          'Compound Wrapped BTC'
        ),
      ],
    },
    {
      underlyingToken: new common.Token(
        common.ChainId.mainnet,
        '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
        18,
        'YFI',
        'yearn.finance'
      ),
      cTokens: [
        new common.Token(
          common.ChainId.mainnet,
          '0x80a2AE356fc9ef4305676f7a3E2Ed04e12C33946',
          8,
          'cYFI',
          'Compound yearn.finance'
        ),
      ],
    },
    {
      underlyingToken: new common.Token(
        common.ChainId.mainnet,
        '0xE41d2489571d322189246DaFA5ebDe1F4699F498',
        18,
        'ZRX',
        '0x Protocol Token'
      ),
      cTokens: [
        new common.Token(
          common.ChainId.mainnet,
          '0xB3319f5D18Bc0D84dD1b4825Dcde5d5f7266d407',
          8,
          'cZRX',
          'Compound 0x'
        ),
      ],
    },
  ],
};

export const supportedChainIds = [config.chainId];

export const COMP = config.COMP;

export const [underlyingTokens, tokenPairs, underlyingToCTokenMap, cTokenToUnderlyingMap] = config.assets.reduce(
  (accumulator, { underlyingToken, cTokens }) => {
    accumulator[0].push(underlyingToken);
    accumulator[1].push({ underlyingToken, cToken: cTokens[0] });
    accumulator[2][underlyingToken.address] = cTokens[0];
    for (const cToken of cTokens) {
      accumulator[3][cToken.address] = underlyingToken;
    }

    return accumulator;
  },
  [
    [] as common.Token[],
    [] as Array<{ underlyingToken: common.Token; cToken: common.Token }>,
    {} as Record<string, common.Token>,
    {} as Record<string, common.Token>,
  ]
);

export function getContractAddress(name: ContractNames) {
  return config.contract[name];
}

export function toCToken(underlyingTokenOrAddress: common.TokenOrAddress) {
  return underlyingToCTokenMap[common.Token.getAddress(underlyingTokenOrAddress)];
}

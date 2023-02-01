import { DAI_MAINNET, ETH_MAINNET, USDC_MAINNET, WBTC_MAINNET, WETH_MAINNET } from './data.mainnet';
import { TokenAmount, TokenAmountField, TokenAmounts } from './token-amount';

describe('TokenAmounts', () => {
  describe('Test new instance', () => {
    test.each<{ name: string; tokenAmounts: TokenAmount[]; expected: TokenAmountField[] }>([
      {
        name: 'without initial token amounts',
        tokenAmounts: [],
        expected: [],
      },
      {
        name: 'with initial token amounts',
        tokenAmounts: [
          new TokenAmount(WBTC_MAINNET, '2'),
          new TokenAmount(DAI_MAINNET, '1'),
          new TokenAmount(USDC_MAINNET, '3'),
          new TokenAmount(DAI_MAINNET, '4'),
          new TokenAmount(USDC_MAINNET, '3'),
        ],
        expected: [
          { token: DAI_MAINNET, amount: '5' },
          { token: USDC_MAINNET, amount: '6' },
          { token: WBTC_MAINNET, amount: '2' },
        ],
      },
    ])('case $#: $name', async ({ tokenAmounts, expected }) => {
      expect(new TokenAmounts(tokenAmounts).toFields()).toStrictEqual(expected);
    });
  });

  describe('Test add', () => {
    test.each<{ tokenAmounts: TokenAmount[]; expected: TokenAmountField[] }>([
      {
        tokenAmounts: [
          new TokenAmount(WBTC_MAINNET, '2'),
          new TokenAmount(DAI_MAINNET, '1'),
          new TokenAmount(USDC_MAINNET, '3'),
          new TokenAmount(DAI_MAINNET, '4'),
          new TokenAmount(USDC_MAINNET, '3'),
        ],
        expected: [
          { token: DAI_MAINNET, amount: '5' },
          { token: USDC_MAINNET, amount: '6' },
          { token: WBTC_MAINNET, amount: '2' },
        ],
      },
      {
        tokenAmounts: [
          new TokenAmount(WBTC_MAINNET, '2'),
          new TokenAmount(DAI_MAINNET, '1'),
          new TokenAmount(ETH_MAINNET, '3'),
          new TokenAmount(WETH_MAINNET, '4'),
          new TokenAmount(USDC_MAINNET, '3'),
        ],
        expected: [
          { token: DAI_MAINNET, amount: '1' },
          { token: ETH_MAINNET, amount: '3' },
          { token: USDC_MAINNET, amount: '3' },
          { token: WBTC_MAINNET, amount: '2' },
          { token: WETH_MAINNET, amount: '4' },
        ],
      },
    ])('case $#', async ({ tokenAmounts, expected }) => {
      const _tokenAmounts = new TokenAmounts();
      for (const tokenAmount of tokenAmounts) {
        _tokenAmounts.add(tokenAmount);
      }
      expect(_tokenAmounts.toFields()).toStrictEqual(expected);
    });
  });

  describe('Test compact', () => {
    test('case 0', () => {
      const tokenAmounts = new TokenAmounts();
      tokenAmounts.add(new TokenAmount(ETH_MAINNET, '3'));
      tokenAmounts.add(new TokenAmount(DAI_MAINNET, '4'));
      tokenAmounts.add(new TokenAmount(USDC_MAINNET, '3'));
      tokenAmounts.sub(new TokenAmount(ETH_MAINNET, '3'));

      expect(tokenAmounts.compact().toFields()).toStrictEqual([
        { token: DAI_MAINNET, amount: '4' },
        { token: USDC_MAINNET, amount: '3' },
      ]);
    });
  });
});

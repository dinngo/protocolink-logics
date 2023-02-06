import { TokenAmount, TokenAmountField, TokenAmountPair, TokenAmounts } from './token-amount';
import { expect } from 'chai';
import * as mainnet from './data.mainnet';

describe('TokenAmount', function () {
  context('Test new instance', function () {
    it('token', function () {
      const token = mainnet.ETH;
      const tokenAmount = new TokenAmount(token);
      expect(tokenAmount.token.is(token)).to.be.true;
      expect(tokenAmount.amount).to.eq('0');
    });

    it('token, amount', function () {
      const token = mainnet.ETH;
      const amount = '1';
      const tokenAmount = new TokenAmount(token, amount);
      expect(tokenAmount.token.is(token)).to.be.true;
      expect(tokenAmount.amount).to.eq(amount);
    });

    it('TokenAmountField', function () {
      const field: TokenAmountField = { token: mainnet.ETH, amount: '1' };
      const tokenAmount = new TokenAmount(field);
      expect(tokenAmount.token.is(field.token)).to.be.true;
      expect(tokenAmount.amount).to.eq(field.amount);
    });

    it('TokenAmountPair', function () {
      const pair: TokenAmountPair = [mainnet.ETH, '1'];
      const tokenAmount = new TokenAmount(pair);
      expect(tokenAmount.token.is(pair[0])).to.be.true;
      expect(tokenAmount.amount).to.eq(pair[1]);
    });

    it('TokenAmount', function () {
      const tokenAmount1 = new TokenAmount(mainnet.ETH, '1');
      const tokenAmount2 = new TokenAmount(tokenAmount1);
      expect(tokenAmount2.token.is(tokenAmount1.token)).to.be.true;
      expect(tokenAmount2.amount).to.eq(tokenAmount1.amount);
    });
  });

  context('Test amountWei', function () {
    const cases: { tokenAmount: TokenAmountPair; expected: string }[] = [
      { tokenAmount: [mainnet.ETH, '1.1234567890123456789'], expected: '1123456789012345678' },
      { tokenAmount: [mainnet.USDC, '1.1234567890123456789'], expected: '1123456' },
    ];

    cases.forEach(({ tokenAmount, expected }) => {
      it(`decimals ${tokenAmount[0].decimals}`, function () {
        const _tokenAmount = new TokenAmount(tokenAmount);
        expect(_tokenAmount.amountWei).to.eq(expected);
      });

      it(`decimals ${tokenAmount[0].decimals}`, function () {
        const _tokenAmount = new TokenAmount(tokenAmount[0]);
        _tokenAmount.set(tokenAmount[1]);
        expect(_tokenAmount.amountWei).to.eq(expected);
      });
    });
  });

  context('Test precise amount', function () {
    const cases: { tokenAmount: TokenAmountPair; expected: string }[] = [
      { tokenAmount: [mainnet.ETH, '1.1234567890123456789'], expected: '1.123456789012345678' },
      { tokenAmount: [mainnet.USDC, '1.1234567890123456789'], expected: '1.123456' },
    ];

    cases.forEach(({ tokenAmount, expected }) => {
      it(`decimals ${tokenAmount[0].decimals} new instance`, function () {
        const _tokenAmount = new TokenAmount(tokenAmount);
        expect(_tokenAmount.amount).to.eq(expected);
      });

      it(`decimals ${tokenAmount[0].decimals} set`, function () {
        const _tokenAmount = new TokenAmount(tokenAmount[0]);
        _tokenAmount.set(tokenAmount[1]);
        expect(_tokenAmount.amount).to.eq(expected);
      });
    });
  });
});

describe('TokenAmounts', function () {
  context('Test new instance', function () {
    it('[]', function () {
      const tokenAmounts = new TokenAmounts();
      expect(tokenAmounts.toPairs()).to.deep.eq([]);
    });

    it('arg0 is TokenAmountField', function () {
      const tokenAmounts = new TokenAmounts({ token: mainnet.ETH, amount: '1' }, [mainnet.WBTC, '2']);
      expect(tokenAmounts.toPairs()).to.deep.eq([
        [mainnet.ETH, '1'],
        [mainnet.WBTC, '2'],
      ]);
    });

    it('arg0 is TokenAmountPair', function () {
      const tokenAmounts = new TokenAmounts([mainnet.WBTC, '2'], { token: mainnet.ETH, amount: '1' });
      expect(tokenAmounts.toPairs()).to.deep.eq([
        [mainnet.ETH, '1'],
        [mainnet.WBTC, '2'],
      ]);
    });

    it('arg0 is TokenAmount', function () {
      const tokenAmount = new TokenAmount(mainnet.DAI, '1');
      const tokenAmounts = new TokenAmounts(tokenAmount, [mainnet.WBTC, '2'], { token: mainnet.ETH, amount: '1' });
      expect(tokenAmounts.toPairs()).to.deep.eq([
        [mainnet.DAI, '1'],
        [mainnet.ETH, '1'],
        [mainnet.WBTC, '2'],
      ]);
    });

    it('arg0 is TokenAmountTypes', function () {
      const tokenAmount = new TokenAmount(mainnet.DAI, '1');
      const tokenAmounts = new TokenAmounts([tokenAmount, [mainnet.WBTC, '2'], { token: mainnet.ETH, amount: '1' }]);
      expect(tokenAmounts.toPairs()).to.deep.eq([
        [mainnet.DAI, '1'],
        [mainnet.ETH, '1'],
        [mainnet.WBTC, '2'],
      ]);
    });
  });

  context('Test add', function () {
    const cases: { tokenAmounts: TokenAmountPair[]; expected: TokenAmountPair[] }[] = [
      {
        tokenAmounts: [
          [mainnet.WBTC, '2'],
          [mainnet.DAI, '1'],
          [mainnet.USDC, '3'],
          [mainnet.DAI, '4'],
          [mainnet.USDC, '3'],
        ],
        expected: [
          [mainnet.DAI, '5'],
          [mainnet.USDC, '6'],
          [mainnet.WBTC, '2'],
        ],
      },
      {
        tokenAmounts: [
          [mainnet.WBTC, '2'],
          [mainnet.DAI, '1'],
          [mainnet.ETH, '3'],
          [mainnet.WETH, '4'],
          [mainnet.USDC, '3'],
        ],
        expected: [
          [mainnet.DAI, '1'],
          [mainnet.ETH, '3'],
          [mainnet.USDC, '3'],
          [mainnet.WBTC, '2'],
          [mainnet.WETH, '4'],
        ],
      },
    ];

    cases.forEach(({ tokenAmounts, expected }, i) => {
      it(`case ${i + 1}`, function () {
        const _tokenAmounts = new TokenAmounts();
        for (const tokenAmount of tokenAmounts) {
          _tokenAmounts.add(tokenAmount);
        }

        expect(_tokenAmounts.toPairs()).to.deep.eq(expected);
      });
    });
  });

  context('Test compact', function () {
    it('case 1', function () {
      const tokenAmounts = new TokenAmounts();
      tokenAmounts.add(mainnet.ETH, '3');
      tokenAmounts.add(mainnet.DAI, '4');
      tokenAmounts.add(mainnet.USDC, '3');
      tokenAmounts.sub(mainnet.ETH, '3');

      expect(tokenAmounts.compact().toPairs()).to.deep.eq([
        [mainnet.DAI, '4'],
        [mainnet.USDC, '3'],
      ]);
    });
  });
});

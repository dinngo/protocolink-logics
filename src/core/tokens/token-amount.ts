import BigNumberJS from 'bignumber.js';
import { BigNumberish } from 'ethers';
import { Token } from './token';
import orderBy from 'lodash/orderBy';
import { toBigUnit, toSmallUnit } from '../utils';

export interface TokenAmountField {
  token: Token;
  amount: string;
}

export class TokenAmount {
  readonly token: Token;
  amount: string;

  constructor(token: Token, amount = '0') {
    this.token = token;
    this.amount = amount;
  }

  get amountWei() {
    return toSmallUnit(this.amount, this.token.decimals);
  }

  set(amount: string) {
    this.amount = amount;
    return this;
  }

  setWei(amountWei: BigNumberish) {
    this.amount = toBigUnit(amountWei, this.token.decimals);
    return this;
  }

  isZero() {
    return BigNumberJS(this.amount).isZero();
  }

  add(amount: string) {
    this.amount = BigNumberJS(this.amount).plus(amount).toString();
    return this;
  }

  sub(amount: string) {
    this.amount = BigNumberJS(this.amount).minus(amount).toString();
    return this;
  }

  toField(): TokenAmountField {
    return { token: this.token, amount: this.amount };
  }
}

export class TokenAmounts {
  tokenAmountMap: Record<string, TokenAmount> = {};

  constructor(tokenAmounts: TokenAmount[] = []) {
    for (const tokenAmount of tokenAmounts) {
      this.add(tokenAmount);
    }
  }

  get(token: Token) {
    return this.tokenAmountMap[token.address];
  }

  set(tokenAmount: TokenAmount) {
    this.tokenAmountMap[tokenAmount.token.address] = tokenAmount;
    return this;
  }

  has(token: Token): boolean {
    return !!this.tokenAmountMap[token.address];
  }

  add(tokenAmount: TokenAmount): TokenAmounts {
    if (this.has(tokenAmount.token)) {
      this.tokenAmountMap[tokenAmount.token.address].add(tokenAmount.amount);
    } else {
      this.set(tokenAmount);
    }
    return this;
  }

  sub(tokenAmount: TokenAmount): TokenAmounts {
    if (this.has(tokenAmount.token)) {
      this.tokenAmountMap[tokenAmount.token.address].sub(tokenAmount.amount);
    }
    return this;
  }

  toArray() {
    return Object.keys(this.tokenAmountMap).map((tokenAddress) => this.tokenAmountMap[tokenAddress]);
  }

  toFields(): TokenAmountField[] {
    return orderBy(
      Object.keys(this.tokenAmountMap).map((tokenAddress) => this.tokenAmountMap[tokenAddress].toField()),
      'token.symbol'
    );
  }

  compact() {
    Object.keys(this.tokenAmountMap).forEach((tokenAddress) => {
      if (this.tokenAmountMap[tokenAddress].isZero()) {
        delete this.tokenAmountMap[tokenAddress];
      }
    });
    return this;
  }
}

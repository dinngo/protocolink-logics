import { BigNumber, BigNumberish } from 'ethers';
import BigNumberJS from 'bignumber.js';
import { Token } from './token';
import invariant from 'tiny-invariant';
import orderBy from 'lodash/orderBy';
import { toBigUnit, toSmallUnit } from '../utils';

export interface TokenAmountField {
  token: Token;
  amount: string;
}

export function isTokenAmountField(v: any): v is TokenAmountField {
  return typeof v === 'object' && v.token instanceof Token && typeof v.amount === 'string';
}

export type TokenAmountPair = [Token, string];

export function isTokenAmountPair(v: any): v is TokenAmountPair {
  return Array.isArray(v) && v[0] instanceof Token && typeof v[1] === 'string';
}

export class TokenAmount {
  readonly token: Token;
  amount: string;

  constructor(token: Token, amount?: string);
  constructor(tokenAmountField: TokenAmountField);
  constructor(tokenAmountPair: TokenAmountPair);
  constructor(tokenAmount: TokenAmount);
  constructor(arg0: any, arg1?: any) {
    if (arg0 instanceof Token) {
      this.token = arg0;
      this.amount = TokenAmount.precise(arg1 ?? '0', this.token.decimals);
    } else if (arg0 instanceof TokenAmount) {
      this.token = arg0.token;
      this.amount = arg0.amount;
    } else if (isTokenAmountField(arg0)) {
      this.token = arg0.token;
      this.amount = TokenAmount.precise(arg0.amount ?? '0', this.token.decimals);
    } else {
      this.token = arg0[0];
      this.amount = TokenAmount.precise(arg0[1] ?? '0', this.token.decimals);
    }
  }

  static precise(amount: string, decimals: number) {
    return BigNumberJS(amount).decimalPlaces(decimals, BigNumberJS.ROUND_DOWN).toString();
  }

  get amountWei() {
    return toSmallUnit(this.amount, this.token.decimals);
  }

  precise(amount: string): string;
  precise(tokenAmount: TokenAmount): string;
  precise(arg0: any) {
    let amount: string;
    if (arg0 instanceof TokenAmount) {
      invariant(arg0.token.is(this.token), "different tokens can't be clone");
      amount = arg0.amount;
    } else {
      amount = TokenAmount.precise(arg0, this.token.decimals);
    }
    return amount;
  }

  set(amount: string): TokenAmount;
  set(tokenAmount: TokenAmount): TokenAmount;
  set(arg0: any) {
    this.amount = this.precise(arg0);
    return this;
  }
  setWei(amountWei: BigNumberish) {
    this.amount = toBigUnit(amountWei, this.token.decimals);
    return this;
  }

  add(amount: string): TokenAmount;
  add(tokenAmount: TokenAmount): TokenAmount;
  add(arg0: any) {
    this.amount = BigNumberJS(this.amount).plus(this.precise(arg0)).toString();
    return this;
  }
  addWei(amountWei: BigNumberish) {
    this.amount = BigNumberJS(this.amount).plus(toBigUnit(amountWei, this.token.decimals)).toString();
    return this;
  }

  sub(amount: string): TokenAmount;
  sub(tokenAmount: TokenAmount): TokenAmount;
  sub(arg0: any) {
    this.amount = BigNumberJS(this.amount).minus(this.precise(arg0)).toString();
    return this;
  }
  subWei(amountWei: BigNumberish) {
    this.amount = BigNumberJS(this.amount).minus(toBigUnit(amountWei, this.token.decimals)).toString();
    return this;
  }

  isZero() {
    return BigNumberJS(this.amount).isZero();
  }

  eq(tokenAmount: TokenAmount) {
    return this.amountWei.eq(tokenAmount.amountWei);
  }

  toPair(): TokenAmountPair {
    return [this.token, this.amount];
  }

  toField(): TokenAmountField {
    return { token: this.token, amount: this.amount };
  }

  toValues(): [string, BigNumber] {
    return [this.token.address, this.amountWei];
  }
}

export type TokenAmountTypes = TokenAmountField | TokenAmountPair | TokenAmount;

export class TokenAmounts implements RelativeIndexable<TokenAmount> {
  tokenAmountMap: Record<string, TokenAmount> = {};

  constructor(tokenAmounts: TokenAmountTypes[]);
  constructor(...tokenAmounts: TokenAmountTypes[]);
  constructor(arg0: any, ...otherArgs: any[]) {
    if (arg0) {
      if (isTokenAmountField(arg0) || isTokenAmountPair(arg0) || arg0 instanceof TokenAmount) {
        this.add(arg0);
      } else {
        for (const tokenAmount of arg0) {
          this.add(tokenAmount);
        }
      }
    }
    for (const tokenAmount of otherArgs) {
      this.add(tokenAmount);
    }
  }

  get length() {
    return Object.keys(this.tokenAmountMap).length;
  }

  at(index: number) {
    return this.toArray()[index];
  }

  get(tokenOrAddress: Token | string) {
    return this.tokenAmountMap[typeof tokenOrAddress === 'string' ? tokenOrAddress : tokenOrAddress.address];
  }

  set(token: Token, amount: string): TokenAmounts;
  set(tokenAmount: TokenAmountTypes): TokenAmounts;
  set(arg0: any, arg1?: any) {
    const tokenAmount = new TokenAmount(arg0, arg1);
    this.tokenAmountMap[tokenAmount.token.address] = tokenAmount;
    return this;
  }

  has(token: Token): boolean {
    return !!this.tokenAmountMap[token.address];
  }

  add(token: Token, amount: string): TokenAmounts;
  add(tokenAmount: TokenAmountTypes): TokenAmounts;
  add(arg0: any, arg1?: any) {
    const tokenAmount = new TokenAmount(arg0, arg1);
    if (this.has(tokenAmount.token)) {
      this.tokenAmountMap[tokenAmount.token.address].add(tokenAmount);
    } else {
      this.set(tokenAmount);
    }
    return this;
  }

  sub(token: Token, amount: string): TokenAmounts;
  sub(tokenAmount: TokenAmountTypes): TokenAmounts;
  sub(arg0: any, arg1?: any) {
    const tokenAmount = new TokenAmount(arg0, arg1);
    if (this.has(tokenAmount.token)) {
      this.tokenAmountMap[tokenAmount.token.address].sub(tokenAmount);
    }
    return this;
  }

  toArray() {
    return Object.keys(this.tokenAmountMap).map((tokenAddress) => this.tokenAmountMap[tokenAddress]);
  }

  toPairs() {
    return orderBy(
      Object.keys(this.tokenAmountMap).map((tokenAddress) => this.tokenAmountMap[tokenAddress].toPair()),
      '0.symbol'
    );
  }

  toFields() {
    return orderBy(
      Object.keys(this.tokenAmountMap).map((tokenAddress) => this.tokenAmountMap[tokenAddress].toField()),
      'token.symbol'
    );
  }

  toValues() {
    return Object.keys(this.tokenAmountMap).reduce(
      (accumulator, tokenAddress) => {
        accumulator[0].push(tokenAddress);
        accumulator[1].push(this.tokenAmountMap[tokenAddress].amountWei);

        return accumulator;
      },
      [[], []] as [string[], BigNumber[]]
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

  isEmpty() {
    return this.length === 0;
  }

  get native() {
    let nativeTokenAmount: TokenAmount | undefined;
    for (const tokenAddress of Object.keys(this.tokenAmountMap)) {
      const tokenAmount = this.tokenAmountMap[tokenAddress];
      if (tokenAmount.token.isNative()) {
        nativeTokenAmount = tokenAmount;
        break;
      }
    }
    return nativeTokenAmount;
  }

  get erc20() {
    return Object.keys(this.tokenAmountMap).reduce((accumulator, tokenAddress) => {
      const tokenAmount = this.tokenAmountMap[tokenAddress];
      if (!tokenAmount.token.isNative()) accumulator.set(tokenAmount);
      return accumulator;
    }, new TokenAmounts());
  }
}

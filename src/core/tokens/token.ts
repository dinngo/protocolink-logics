import { ELASTIC_ADDRESS } from './constants';
import { getConfig } from '../network';

export interface TokenObject {
  chainId: number;
  address: string;
  decimals: number;
  symbol: string;
  name: string;
}

export function isTokenObject(v: any): v is TokenObject {
  return (
    typeof v === 'object' &&
    typeof v.chainId === 'number' &&
    typeof v.address === 'string' &&
    typeof v.decimals === 'number' &&
    typeof v.symbol === 'string' &&
    typeof v.name === 'string'
  );
}

export class Token {
  readonly chainId: number;
  readonly address: string;
  readonly decimals: number;
  readonly symbol: string;
  readonly name: string;

  constructor(chainId: number, address: string, decimals: number, symbol: string, name: string);
  constructor(tokenObject: TokenObject);
  constructor(arg0: any, ...otherArgs: any[]) {
    if (isTokenObject(arg0)) {
      this.chainId = arg0.chainId;
      this.address = arg0.address;
      this.decimals = arg0.decimals;
      this.symbol = arg0.symbol;
      this.name = arg0.name;
    } else {
      this.chainId = arg0;
      this.address = otherArgs[0];
      this.decimals = otherArgs[1];
      this.symbol = otherArgs[2];
      this.name = otherArgs[3];
    }
  }

  isNative() {
    return this.is(getConfig(this.chainId).nativeToken);
  }

  isWrapped() {
    return this.is(getConfig(this.chainId).wrappedNativeToken);
  }

  is(token: Token | TokenObject) {
    return this.chainId === token.chainId && this.address === token.address;
  }

  wrapped() {
    return this.isNative() ? new Token(getConfig(this.chainId).wrappedNativeToken) : this;
  }

  get elasticAddress() {
    return this.isNative() ? ELASTIC_ADDRESS : this.address;
  }

  sortsBefore(token: Token) {
    return this.wrapped().address.toLowerCase() < token.wrapped().address.toLowerCase();
  }

  toObject(): TokenObject {
    return {
      chainId: this.chainId,
      address: this.address,
      decimals: this.decimals,
      symbol: this.symbol,
      name: this.name,
    };
  }
}

export function toTokenMap<T extends string>(tokensJson: Record<string, TokenObject>): Record<T, Token> {
  return Object.keys(tokensJson).reduce((accumulator, symbol) => {
    accumulator[symbol] = new Token(tokensJson[symbol]);
    return accumulator;
  }, {} as Record<string, Token>);
}

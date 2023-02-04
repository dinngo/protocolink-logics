import { ELASTIC_ADDRESS } from './constants';
import { getConfig } from '../network';

export class Token {
  readonly chainId: number;
  readonly address: string;
  readonly decimals: number;
  readonly symbol: string;
  readonly name: string;

  constructor(chainId: number, address: string, decimals: number, symbol: string, name: string) {
    this.chainId = chainId;
    this.address = address;
    this.decimals = decimals;
    this.symbol = symbol;
    this.name = name;
  }

  isNative() {
    return this.is(getConfig(this.chainId).nativeToken);
  }

  isWrapped() {
    return this.is(getConfig(this.chainId).wrappedNativeToken);
  }

  is(token: Token) {
    return this.chainId === token.chainId && this.address === token.address;
  }

  wrapped() {
    return this.isNative() ? getConfig(this.chainId).wrappedNativeToken : this;
  }

  get elasticAddress() {
    return this.isNative() ? ELASTIC_ADDRESS : this.address;
  }

  sortsBefore(token: Token) {
    return this.wrapped().address.toLowerCase() < token.wrapped().address.toLowerCase();
  }
}

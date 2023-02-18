import { Token, TokenObject, TokenOrAddress } from './token';
import { TokenAmount, TokenAmountObject } from './token-amount';
import { providers } from 'ethers';
export declare function toTokenMap<T extends string>(tokenObjectMap: Record<string, TokenObject>): Record<T, Token>;
export declare function getNativeToken(chainId: number): Token;
export declare function getWrappedNativeToken(chainId: number): Token;
export declare function sortByAddress<T extends Token | TokenObject | TokenAmount | TokenAmountObject>(tokenOrAmounts: T[]): T[];
export declare function tokenOrAddressToToken(chainId: number, tokenOrAddress: TokenOrAddress, provider?: providers.Provider): Promise<Token>;

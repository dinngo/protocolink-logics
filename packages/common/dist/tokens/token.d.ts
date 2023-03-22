export interface TokenObject {
    chainId: number;
    address: string;
    decimals: number;
    symbol: string;
    name: string;
}
export declare class Token {
    readonly chainId: number;
    readonly address: string;
    readonly decimals: number;
    readonly symbol: string;
    readonly name: string;
    constructor(chainId: number, address: string, decimals: number, symbol: string, name: string);
    constructor(tokenObject: TokenObject);
    static from(token: TokenTypes): Token;
    static isNative(chainId: number, address: string): boolean;
    static isNative(token: TokenTypes): boolean;
    static isWrapped(chainId: number, address: string): boolean;
    static isWrapped(token: TokenTypes): boolean;
    static getAddress(tokenOrAddress: TokenOrAddress): string;
    is(token: TokenTypes): boolean;
    get isNative(): boolean;
    get isWrapped(): boolean;
    get wrapped(): Token;
    get unwrapped(): Token;
    get elasticAddress(): string;
    sortsBefore(token: TokenTypes): boolean;
    toObject(): TokenObject;
}
export type TokenTypes = TokenObject | Token;
export type TokenOrAddress = TokenTypes | string;
export declare function isTokenObject(v: any): v is TokenObject;
export declare function isToken(v: any): v is Token;
export declare function isTokenTypes(v: any): v is TokenTypes;
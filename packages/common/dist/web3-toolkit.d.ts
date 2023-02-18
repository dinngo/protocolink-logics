import { BigNumber, providers } from 'ethers';
import { Token, TokenOrAddress } from './tokens';
import { Multicall2 } from './contracts';
import { Network } from './networks';
export declare class Web3Toolkit {
    readonly chainId: number;
    readonly network: Network;
    readonly provider: providers.Provider;
    readonly nativeToken: Token;
    readonly wrappedNativeToken: Token;
    constructor(chainId: number, provider?: providers.Provider);
    get multicall2(): Multicall2;
    getToken(tokenAddress: string): Promise<Token>;
    getTokens(tokenAddresses: string[]): Promise<Token[]>;
    getAllowance(account: string, tokenOrAddress: TokenOrAddress, spender: string): Promise<BigNumber>;
    getAllowances(account: string, tokenOrAddresses: TokenOrAddress[], spender: string): Promise<BigNumber[]>;
}

export interface Network {
    id: string;
    chainId: number;
    name: string;
    explorerUrl: string;
    rpcUrl: string;
    nativeToken: {
        chainId: number;
        address: string;
        decimals: number;
        symbol: string;
        name: string;
    };
    wrappedNativeToken: {
        chainId: number;
        address: string;
        decimals: number;
        symbol: string;
        name: string;
    };
    multicall2Address: string;
}
export declare const networks: Network[];
export declare const networkMap: Record<number, Network>;
export declare function getNetwork(chainId: number): Network;
export declare function getNetworkId(chainId: number): string;
export declare enum ChainId {
    mainnet = 1,
    polygon = 137,
    arbitrum = 42161,
    optimism = 10,
    avalanche = 43114,
    fantom = 250
}
export declare enum NetworkId {
    mainnet = "mainnet",
    polygon = "polygon",
    arbitrum = "arbitrum",
    optimism = "optimism",
    avalanche = "avalanche",
    fantom = "fantom"
}
export declare function isSupportedChainId(chainId: number): boolean;
export declare function isSupportedNetworkId(networkId: string): boolean;

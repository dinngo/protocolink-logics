type ContractNames = 'Router' | 'AgentImplementation';
export declare const contractAddressMap: Record<number, {
    [k in ContractNames]: string;
}>;
export declare function getContractAddress(chainId: number, name: ContractNames): string;
export declare function setContractAddress(chainId: number, name: ContractNames, address: string): void;
export {};

import { Signer } from 'ethers';
import type { Provider } from '@ethersproject/providers';
import type { WETH, WETHInterface } from '../WETH';
export declare class WETH__factory {
    static readonly abi: readonly [{
        readonly constant: false;
        readonly inputs: readonly [];
        readonly name: "deposit";
        readonly outputs: readonly [];
        readonly payable: true;
        readonly stateMutability: "payable";
        readonly type: "function";
    }, {
        readonly constant: false;
        readonly inputs: readonly [{
            readonly name: "wad";
            readonly type: "uint256";
        }];
        readonly name: "withdraw";
        readonly outputs: readonly [];
        readonly payable: false;
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): WETHInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): WETH;
}

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as common from '@composable-router/common';
import { providers } from 'ethers';
export declare function getBalance(account: string, tokenOrAddress: common.TokenOrAddress, blockTag?: providers.BlockTag): Promise<common.TokenAmount>;
export declare function approve(user: SignerWithAddress, spender: string, tokenAmount: common.TokenAmount): Promise<void>;
export declare function approves(user: SignerWithAddress, spender: string, tokenAmounts: common.TokenAmounts): Promise<void[]>;

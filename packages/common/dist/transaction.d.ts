import { BigNumberish, providers } from 'ethers';
import { SetRequired } from 'type-fest';
import { Token } from './tokens';
export type TransactionRequest = SetRequired<Pick<providers.TransactionRequest, 'to' | 'data' | 'value' | 'gasLimit'>, 'to' | 'data'>;
export declare function newErc20ApproveTransactionRequest(token: Token, spender: string, amountWei?: BigNumberish): TransactionRequest;

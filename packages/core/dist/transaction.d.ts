import { BigNumberish } from 'ethers';
import { IRouter } from './contracts/Router';
import * as common from '@composable-router/common';
export interface NewRouterExecuteTransactionOptions {
    chainId: number;
    routerLogics: IRouter.LogicStruct[];
    tokensReturn?: string[];
    value?: BigNumberish;
}
export declare function newRouterExecuteTransactionRequest(options: NewRouterExecuteTransactionOptions): common.TransactionRequest;

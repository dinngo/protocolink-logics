import { BigNumberish } from 'ethers';
import { IParam } from './contracts/Router';
import * as common from '@composable-router/common';
export interface NewLogicInputOptions {
    input: common.TokenAmount;
    amountBps?: BigNumberish;
    amountOffset?: BigNumberish;
}
export declare function newLogicInput(options: NewLogicInputOptions): IParam.InputStruct;
export interface NewLogicOptions {
    to: string;
    data: string;
    inputs?: IParam.InputStruct[];
    wrapMode?: number;
    approveTo?: string;
    callback?: string;
}
export declare function newLogic(options: NewLogicOptions): {
    to: string;
    data: string;
    inputs: IParam.InputStruct[];
    wrapMode: number;
    approveTo: string;
    callback: string;
};

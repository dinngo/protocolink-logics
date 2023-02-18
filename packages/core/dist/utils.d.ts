import { BigNumberish } from 'ethers';
import { IRouter } from './contracts/Router';
import * as common from '@composable-router/common';
export interface NewLogicInputOptions {
    input: common.TokenAmount;
    amountBps?: BigNumberish;
    amountOffset?: BigNumberish;
}
export declare function newLogicInput(options: NewLogicInputOptions): IRouter.InputStruct;
export interface NewLogicOutputOptions {
    output: common.TokenAmount;
    slippage?: number;
}
export declare function newLogicOutput(options: NewLogicOutputOptions): IRouter.OutputStruct;
export interface NewLogicOptions {
    to: string;
    data: string;
    inputs?: IRouter.InputStruct[];
    outputs?: IRouter.OutputStruct[];
    approveTo?: string;
    callback?: string;
}
export declare function newLogic(options: NewLogicOptions): {
    to: string;
    data: string;
    inputs: IRouter.InputStruct[];
    outputs: IRouter.OutputStruct[];
    approveTo: string;
    callback: string;
};

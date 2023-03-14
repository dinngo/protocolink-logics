import { IParam } from './contracts/Router';
import * as common from '@composable-router/common';
export declare abstract class Logic extends common.Web3Toolkit {
    static id: string;
    static protocol: string;
    static get rid(): string;
    abstract getLogic(fields: any, options?: any): Promise<IParam.LogicStruct>;
}
export interface LogicInterfaceGetSupportedTokens {
    getSupportedTokens(): any;
}
export interface LogicInterfaceGetPrice {
    getPrice(params: any): any;
}
export interface LogicClassInterface {
    new (...args: any[]): Logic;
    id: string;
    protocol: string;
    rid: string;
    supportedChainIds: number[];
}
export declare function LogicDefinitionDecorator(): (logic: LogicClassInterface) => void;

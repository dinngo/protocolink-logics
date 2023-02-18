import { IRouter } from './contracts/Router';
import * as common from '@composable-router/common';
export interface LogicInstanceInterface {
    getLogic(fields: object, options?: object): Promise<IRouter.LogicStruct>;
}
export declare abstract class Logic extends common.Web3Toolkit {
    static id: string;
    static protocol: string;
    static get rid(): string;
    abstract getLogic(fields: object, options?: object): Promise<IRouter.LogicStruct>;
}
export declare abstract class ExchangeLogic extends Logic {
    abstract getPrice(params: object): unknown;
}
export interface LogicInterface {
    new (...args: any[]): Logic;
    id: string;
    protocol: string;
    rid: string;
    supportedChainIds: number[];
}
export declare function LogicDefinitionDecorator(): (logic: LogicInterface) => void;

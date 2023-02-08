import { IRouter } from '../contracts/Router';
import { PromiseOrValue } from 'src/types';
import * as core from 'src/core';

export type LogicBaseOptions<T extends object = object> = core.Web3ToolkitOptions<T>;

export abstract class LogicBase extends core.Web3Toolkit {
  abstract getLogic(options: unknown): PromiseOrValue<IRouter.LogicStruct>;
}

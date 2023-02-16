import { IRouter } from '../contracts/Router';
import * as core from 'src/core';

export type LogicBaseOptions<T extends object = object> = core.Web3ToolkitOptions<T>;

export abstract class LogicBase extends core.Web3Toolkit {
  abstract getLogic(options: unknown): Promise<IRouter.LogicStruct>;
}

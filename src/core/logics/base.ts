import { ERC20__factory, Multicall2, Multicall2__factory } from '../contracts';
import { IRouter } from '@composable-router/contracts/typechain';
import { NetworkConfig, getNetwork } from '../network';
import { PromiseOrValue } from '../types';
import { TokenAmounts } from 'src/core';
import { providers } from 'ethers';

export interface LogicBaseOptions {
  chainId: number;
  provider?: providers.Provider;
}

export type LogicEncodeOptions<T extends object = object> = {
  account: string;
  funds: TokenAmounts;
  slippage: number;
} & T;

export abstract class LogicBase {
  public readonly chainId: number;
  public readonly network: NetworkConfig;
  public readonly provider: providers.Provider;
  public readonly multicall2: Multicall2;

  constructor(options: LogicBaseOptions) {
    const { chainId, provider } = options;

    this.chainId = chainId;
    this.network = getNetwork(chainId);
    this.provider = provider ? provider : new providers.JsonRpcProvider(this.network.rpcUrl);
    this.multicall2 = Multicall2__factory.connect(this.network.multicall2Address, this.provider);
  }

  newERC20Contract(address: string) {
    return ERC20__factory.connect(address, this.provider);
  }

  abstract getLogic(options: unknown): PromiseOrValue<IRouter.LogicStruct>;
}

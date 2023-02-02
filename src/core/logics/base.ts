import { ERC20__factory, Multicall2, Multicall2__factory } from '../contracts';
import { IRouter } from '../contracts/Router';
import { NetworkConfig, getNetworkConfig } from '../network';
import { PromiseOrValue } from '../types';
import { RouterConfig, getRouterConfig } from '../router';
import { providers } from 'ethers';

export type LogicBaseOptions<T extends object = object> = {
  chainId: number;
  provider?: providers.Provider;
} & T;

export abstract class LogicBase {
  public readonly chainId: number;
  public readonly networkConfig: NetworkConfig;
  public readonly routerConfig: RouterConfig;
  public readonly provider: providers.Provider;
  public readonly multicall2: Multicall2;

  constructor(options: LogicBaseOptions) {
    const { chainId, provider } = options;

    this.chainId = chainId;
    this.networkConfig = getNetworkConfig(chainId);
    this.routerConfig = getRouterConfig(chainId);
    this.provider = provider ? provider : new providers.JsonRpcProvider(this.networkConfig.rpcUrl);
    this.multicall2 = Multicall2__factory.connect(this.networkConfig.multicall2Address, this.provider);
  }

  newERC20Contract(address: string) {
    return ERC20__factory.connect(address, this.provider);
  }

  abstract getLogic(options: unknown): PromiseOrValue<IRouter.LogicStruct>;
}

import * as contracts from './contracts';
import * as network from './network';
import { providers } from 'ethers';

export type Web3ToolkitOptions<T extends object = object> = {
  chainId: number;
  provider?: providers.Provider;
} & T;

export abstract class Web3Toolkit {
  public readonly chainId: number;
  public readonly networkConfig: network.NetworkConfig;
  public readonly provider: providers.Provider;
  public readonly multicall2: contracts.Multicall2;

  constructor(options: Web3ToolkitOptions) {
    const { chainId, provider } = options;

    this.chainId = chainId;
    this.networkConfig = network.getConfig(chainId);
    this.provider = provider ? provider : new providers.JsonRpcProvider(this.networkConfig.rpcUrl);
    this.multicall2 = contracts.Multicall2__factory.connect(this.networkConfig.multicall2Address, this.provider);
  }
}

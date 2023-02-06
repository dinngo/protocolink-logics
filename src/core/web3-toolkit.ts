import * as contracts from './contracts';
import * as network from './network';
import { providers, utils } from 'ethers';
import * as tokens from './tokens';

export type Web3ToolkitOptions<T extends object = object> = {
  chainId: number;
  provider?: providers.Provider;
} & T;

export class Web3Toolkit {
  readonly chainId: number;
  readonly networkConfig: network.NetworkConfig;
  readonly provider: providers.Provider;

  constructor(options: Web3ToolkitOptions) {
    const { chainId, provider } = options;

    this.chainId = chainId;
    this.networkConfig = network.getConfig(chainId);
    this.provider = provider ? provider : new providers.JsonRpcProvider(this.networkConfig.rpcUrl);
  }

  get multicall2() {
    return contracts.Multicall2__factory.connect(this.networkConfig.multicall2Address, this.provider);
  }

  async getToken(tokenAddress: string) {
    if (tokenAddress === this.networkConfig.nativeToken.address || tokenAddress === tokens.ELASTIC_ADDRESS) {
      return this.networkConfig.nativeToken;
    }

    const iface = contracts.ERC20__factory.createInterface();

    const calls: contracts.Multicall2.CallStruct[] = [
      { target: tokenAddress, callData: iface.encodeFunctionData('decimals') },
      { target: tokenAddress, callData: iface.encodeFunctionData('symbol') },
      { target: tokenAddress, callData: iface.encodeFunctionData('name') },
    ];
    const { returnData } = await this.multicall2.callStatic.aggregate(calls);

    const [decimals] = iface.decodeFunctionResult('decimals', returnData[0]);

    let symbol: string;
    let name: string;
    try {
      [symbol] = iface.decodeFunctionResult('symbol', returnData[1]);
      [name] = iface.decodeFunctionResult('name', returnData[2]);
    } catch {
      symbol = utils.parseBytes32String(returnData[1]);
      name = utils.parseBytes32String(returnData[2]);
    }

    return new tokens.Token(this.chainId, tokenAddress, decimals, symbol, name);
  }

  async getTokens(tokenAddresses: string[]) {
    const iface = contracts.ERC20__factory.createInterface();
    const calls: contracts.Multicall2.CallStruct[] = [];
    for (const tokenAddress of tokenAddresses) {
      if (tokenAddress !== this.networkConfig.nativeToken.address && tokenAddress !== tokens.ELASTIC_ADDRESS) {
        calls.push({ target: tokenAddress, callData: iface.encodeFunctionData('decimals') });
        calls.push({ target: tokenAddress, callData: iface.encodeFunctionData('symbol') });
        calls.push({ target: tokenAddress, callData: iface.encodeFunctionData('name') });
      }
    }
    const { returnData } = await this.multicall2.callStatic.aggregate(calls);

    const _tokens: tokens.Token[] = [];
    let j = 0;
    for (const tokenAddress of tokenAddresses) {
      if (tokenAddress === this.networkConfig.nativeToken.address || tokenAddress === tokens.ELASTIC_ADDRESS) {
        _tokens.push(this.networkConfig.nativeToken);
      } else {
        const [decimals] = iface.decodeFunctionResult('decimals', returnData[j]);
        j++;
        let symbol: string;
        let name: string;
        try {
          [symbol] = iface.decodeFunctionResult('symbol', returnData[j]);
          j++;
          [name] = iface.decodeFunctionResult('name', returnData[j]);
          j++;
        } catch {
          symbol = utils.parseBytes32String(returnData[j]);
          j++;
          name = utils.parseBytes32String(returnData[j]);
          j++;
        }
        _tokens.push(new tokens.Token(this.chainId, tokenAddress, decimals, symbol, name));
      }
    }

    return _tokens;
  }
}

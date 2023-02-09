import { ELASTIC_ADDRESS, Token } from './tokens';
import { ERC20__factory, Multicall2, Multicall2__factory } from './contracts';
import { NetworkConfig, getConfig } from './network';
import { providers, utils } from 'ethers';

export type Web3ToolkitOptions<T extends object = object> = {
  chainId: number;
  provider?: providers.Provider;
} & T;

export class Web3Toolkit {
  readonly chainId: number;
  readonly networkConfig: NetworkConfig;
  readonly provider: providers.Provider;
  readonly nativeToken: Token;
  readonly wrappedNativeToken: Token;

  constructor(options: Web3ToolkitOptions) {
    const { chainId, provider } = options;

    this.chainId = chainId;
    this.networkConfig = getConfig(chainId);
    this.provider = provider ? provider : new providers.JsonRpcProvider(this.networkConfig.rpcUrl);
    this.nativeToken = new Token(this.networkConfig.nativeToken);
    this.wrappedNativeToken = new Token(this.networkConfig.wrappedNativeToken);
  }

  get multicall2() {
    return Multicall2__factory.connect(this.networkConfig.multicall2Address, this.provider);
  }

  async getToken(tokenAddress: string) {
    if (tokenAddress === this.nativeToken.address || tokenAddress === ELASTIC_ADDRESS) {
      return this.nativeToken;
    }

    const iface = ERC20__factory.createInterface();

    const calls: Multicall2.CallStruct[] = [
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

    return new Token(this.chainId, tokenAddress, decimals, symbol, name);
  }

  async getTokens(tokenAddresses: string[]) {
    const iface = ERC20__factory.createInterface();
    const calls: Multicall2.CallStruct[] = [];
    for (const tokenAddress of tokenAddresses) {
      if (tokenAddress !== this.nativeToken.address && tokenAddress !== ELASTIC_ADDRESS) {
        calls.push({ target: tokenAddress, callData: iface.encodeFunctionData('decimals') });
        calls.push({ target: tokenAddress, callData: iface.encodeFunctionData('symbol') });
        calls.push({ target: tokenAddress, callData: iface.encodeFunctionData('name') });
      }
    }
    const { returnData } = await this.multicall2.callStatic.aggregate(calls);

    const tokens: Token[] = [];
    let j = 0;
    for (const tokenAddress of tokenAddresses) {
      if (tokenAddress === this.nativeToken.address || tokenAddress === ELASTIC_ADDRESS) {
        tokens.push(this.nativeToken);
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
        tokens.push(new Token(this.chainId, tokenAddress, decimals, symbol, name));
      }
    }

    return tokens;
  }
}

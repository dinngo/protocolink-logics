import { CErc20__factory } from './contracts/factories/CErc20__factory';
import { CompoundLens__factory, Comptroller__factory } from './contracts';
import * as core from 'src/core';
import { getContractAddress } from './config';

export class CompoundV2Service extends core.Web3Toolkit {
  readonly comptrollerAddress: string;
  readonly compoundLensAddress: string;

  constructor(options: core.Web3ToolkitOptions) {
    super(options);
    const { chainId } = options;
    this.comptrollerAddress = getContractAddress(chainId, 'Comptroller');
    this.compoundLensAddress = getContractAddress(chainId, 'CompoundLens');
  }

  get comptroller() {
    return Comptroller__factory.connect(this.comptrollerAddress, this.provider);
  }

  get compoundLens() {
    return CompoundLens__factory.connect(this.compoundLensAddress, this.provider);
  }

  async toUnderlyingTokens(cTokens: core.tokens.Token[]) {
    const calls: core.contracts.Multicall2.CallStruct[] = [];
    const iface = CErc20__factory.createInterface();
    for (const cToken of cTokens) {
      if (cToken.symbol !== 'cETH') {
        calls.push({ target: cToken.address, callData: iface.encodeFunctionData('underlying') });
      }
    }
    const { returnData } = await this.multicall2.callStatic.aggregate(calls);

    const tokenAddresses: string[] = [];
    let j = 0;
    for (const cToken of cTokens) {
      if (cToken.symbol === 'cETH') {
        tokenAddresses.push(this.nativeToken.address);
      } else {
        const [underlying] = iface.decodeFunctionResult('underlying', returnData[j]);
        j++;
        tokenAddresses.push(underlying);
      }
    }

    const tokens = this.getTokens(tokenAddresses);

    return tokens;
  }
}

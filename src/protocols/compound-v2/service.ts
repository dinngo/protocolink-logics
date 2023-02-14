import { CErc20__factory } from './contracts/factories/CErc20__factory';
import { COMP, isCToken, toCToken, toUnderlyingToken } from './tokens';
import { CompoundLens__factory } from './contracts/factories/CompoundLens__factory';
import * as core from 'src/core';
import { getContractAddress } from './config';

export class CompoundV2Service extends core.Web3Toolkit {
  constructor({ provider }: Pick<core.Web3ToolkitOptions, 'provider'>) {
    const chainId = core.network.ChainId.mainnet;
    super({ chainId, provider });
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

  async getBorrowBalance(borrower: string, token: core.tokens.Token) {
    let underlyingToken: core.tokens.Token;
    let cToken: core.tokens.Token;
    if (isCToken(token)) {
      underlyingToken = toUnderlyingToken(token);
      cToken = token;
    } else {
      underlyingToken = token;
      cToken = toCToken(token);
    }
    const cTokenContract = CErc20__factory.connect(cToken.address, this.provider);
    const borrowBalanceWei = await cTokenContract.callStatic.borrowBalanceCurrent(borrower);
    const borrowBalance = new core.tokens.TokenAmount(underlyingToken).setWei(borrowBalanceWei);

    return borrowBalance;
  }

  async getAllocatedCOMP(holder: string) {
    const compoundLens = CompoundLens__factory.connect(getContractAddress('CompoundLens'), this.provider);
    const metadata = await compoundLens.callStatic.getCompBalanceMetadataExt(
      COMP.address,
      getContractAddress('Comptroller'),
      holder
    );
    const allocatedCOMP = new core.tokens.TokenAmount(COMP).setWei(metadata.allocated);

    return allocatedCOMP;
  }
}

import { FeeAmount, computePoolAddress } from '@uniswap/v3-sdk';
import { Token } from '@uniswap/sdk-core';
import { TokenList } from '@uniswap/token-lists';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { getConfig, supportedChainIds } from './configs';
import { providers } from 'ethers';
import * as univ3 from 'src/modules/univ3';

export type SwapTokenLogicTokenList = common.Token[];

export type SwapTokenLogicParams = univ3.SwapTokenLogicParams;

export type SwapTokenLogicFields = univ3.SwapTokenLogicFields;

export type SwapTokenLogicOptions = univ3.SwapTokenLogicOptions;

export class SwapTokenLogic
  extends univ3.SwapTokenLogic
  implements core.LogicTokenListInterface, core.LogicOracleInterface, core.LogicBuilderInterface
{
  static id = 'swap-token';
  static protocolId = 'uniswap-v3';
  static readonly supportedChainIds = supportedChainIds;

  constructor(chainId: number, provider?: providers.Provider) {
    super({ chainId, provider, config: getConfig(chainId) });
  }

  async getTokenList() {
    const response = await fetch('https://gateway.ipfs.io/ipns/tokens.uniswap.org', { method: 'GET' });
    const data: TokenList = await response.json();

    const tmp: Record<string, boolean> = { [this.nativeToken.address]: true };
    const tokenList: SwapTokenLogicTokenList = [this.nativeToken];
    for (const { chainId, address, decimals, symbol, name, logoURI } of data.tokens) {
      if (tmp[address] || chainId !== this.chainId) continue;
      tokenList.push(new common.Token(chainId, address, decimals, symbol, name, logoURI));
      tmp[address] = true;
    }

    return tokenList;
  }

  public async computePoolAddress({
    factoryAddress,
    tokenA,
    tokenB,
    fee,
    initCodeHashManualOverride,
  }: {
    factoryAddress: string;
    tokenA: Token;
    tokenB: Token;
    fee: FeeAmount;
    initCodeHashManualOverride?: string | undefined;
  }): Promise<string> {
    return computePoolAddress({ factoryAddress, tokenA, tokenB, fee, initCodeHashManualOverride });
  }
}

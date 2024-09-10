import { BigNumber, constants, providers } from 'ethers';
import { FeeAmount } from '@uniswap/v3-sdk';
import { Token } from '@uniswap/sdk-core';
import { TokenList } from '@uniswap/token-lists';
import { UniswapV3Factory__factory } from './contracts';
import { axios } from 'src/utils';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { getConfig, supportedChainIds } from './configs';
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
  static protocolId = 'wagmi';
  static readonly supportedChainIds = supportedChainIds;

  constructor(chainId: number, provider?: providers.Provider) {
    super({ chainId, provider, config: getConfig(chainId) });
  }

  async getTokenList() {
    const { data } = await axios.get<TokenList>(
      'https://raw.githubusercontent.com/RealWagmi/tokenlists/main/tokenlist.json'
    );

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
  }: {
    factoryAddress: string;
    tokenA: Token;
    tokenB: Token;
    fee: FeeAmount;
  }): Promise<string> {
    let poolAddress = constants.AddressZero;
    if (tokenA && tokenB && !tokenA.equals(tokenB)) {
      const tokenIn = univ3.toPTLKToken(tokenA);
      const tokenOut = univ3.toPTLKToken(tokenB);
      const [token0, token1] = tokenIn.sortsBefore(tokenOut) ? [tokenIn, tokenOut] : [tokenOut, tokenIn];

      poolAddress = await UniswapV3Factory__factory.connect(factoryAddress, this.provider).getPool(
        token0.address,
        token1.address,
        BigNumber.from(fee.toString())
      );
    }
    return poolAddress;
  }
}

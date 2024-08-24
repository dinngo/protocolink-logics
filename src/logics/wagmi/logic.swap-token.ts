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
    const callsGetPool: common.Multicall3.CallStruct[] = [];
    const iface = UniswapV3Factory__factory.createInterface();

    if (tokenA && tokenB && !tokenA.equals(tokenB)) {
      const tokenIn = univ3.toPTLKToken(tokenA);
      const tokenOut = univ3.toPTLKToken(tokenB);
      const [token0, token1] = tokenIn.sortsBefore(tokenOut) ? [tokenIn, tokenOut] : [tokenOut, tokenIn];

      const callDataGetPool = iface.encodeFunctionData('getPool', [
        token0.address,
        token1.address,
        BigNumber.from(fee.toString()),
      ]);

      callsGetPool.push({ target: factoryAddress, callData: callDataGetPool });
    } else {
    }

    const [resultsGetPool] = await Promise.all([this.multicall3.callStatic.tryAggregate(false, callsGetPool)]);

    // decode multicall results
    let poolAddress = constants.AddressZero;
    const resultGetPair = resultsGetPool[0];
    if (resultGetPair.success && resultGetPair.returnData !== '0x') {
      [poolAddress] = iface.decodeFunctionResult('getPool', resultGetPair.returnData);
    }
    return poolAddress;
  }
}

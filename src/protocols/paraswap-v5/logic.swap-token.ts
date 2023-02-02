import { BuildSwapTxInput, SimpleFetchSDK, constructSimpleSDK } from '@paraswap/sdk';
import {
  LogicBase,
  LogicBaseOptions,
  LogicGlobalOptions,
  TokenAmount,
  TokenToTokenData,
  TokenToTokenExactInData,
  TokenToTokenLogicInterface,
  newLogicInput,
  newLogicOutput,
} from 'src/core';
import axios from 'axios';
import { constants } from 'ethers';

export type ParaswapV5SwapTokenLogicGetPriceOptions = TokenToTokenExactInData;

export type ParaswapV5SwapTokenLogicGetLogicOptions = TokenToTokenData &
  Pick<BuildSwapTxInput, 'partner' | 'partnerAddress'> &
  Pick<LogicGlobalOptions, 'account' | 'funds' | 'slippage'>;

export class ParaswapV5SwapTokenLogic extends LogicBase implements TokenToTokenLogicInterface {
  private sdk: SimpleFetchSDK;

  constructor(options: LogicBaseOptions) {
    super(options);
    this.sdk = constructSimpleSDK({ chainId: this.chainId, axios });
  }

  async getPrice(options: ParaswapV5SwapTokenLogicGetPriceOptions) {
    const { input, tokenOut } = options;

    const { destAmount } = await this.sdk.swap.getRate({
      srcToken: input.token.elasticAddress,
      srcDecimals: input.token.decimals,
      amount: input.amountWei.toString(),
      destToken: tokenOut.elasticAddress,
      destDecimals: tokenOut.decimals,
    });
    const output = new TokenAmount(tokenOut, destAmount);

    return output;
  }

  async getLogic(options: ParaswapV5SwapTokenLogicGetLogicOptions) {
    const { funds, account, slippage, input, output, partner, partnerAddress } = options;

    const priceRoute = await this.sdk.swap.getRate({
      srcToken: input.token.elasticAddress,
      amount: input.amountWei.toString(),
      destToken: output.token.elasticAddress,
    });
    const { srcToken, srcDecimals, srcAmount, destToken, destDecimals, destAmount } = priceRoute;
    output.setWei(destAmount);

    const { to, data } = await this.sdk.swap.buildTx(
      {
        srcToken,
        srcDecimals,
        destToken,
        destDecimals,
        srcAmount,
        userAddress: account,
        partner,
        partnerAddress,
        slippage,
        deadline: (Math.floor(Date.now() / 1000) + 1200).toString(),
        priceRoute,
      },
      { ignoreChecks: true, ignoreGasEstimate: true }
    );

    return {
      to,
      data,
      inputs: [newLogicInput({ funds, input })],
      outputs: [newLogicOutput({ output, slippage })],
      callback: constants.AddressZero,
    };
  }
}

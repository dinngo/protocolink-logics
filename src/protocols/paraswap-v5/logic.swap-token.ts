import { BuildSwapTxInput, SimpleFetchSDK, constructSimpleSDK } from '@paraswap/sdk';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import * as core from 'src/core';
import { getContractAddress } from './config';
import * as rt from 'src/router';

axiosRetry(axios, { retries: 5, retryDelay: axiosRetry.exponentialDelay });

export type ParaswapV5SwapTokenLogicGetPriceOptions = rt.logics.TokenToTokenExactInData;

export type ParaswapV5SwapTokenLogicGetLogicOptions = rt.logics.TokenToTokenData &
  Pick<BuildSwapTxInput, 'partner' | 'partnerAddress'> &
  Pick<rt.RouterGlobalOptions, 'account' | 'slippage'>;

export class ParaswapV5SwapTokenLogic extends rt.logics.LogicBase implements rt.logics.TokenToTokenLogicInterface {
  private sdk: SimpleFetchSDK;
  readonly tokenTransferProxyAddress: string;

  constructor(options: rt.logics.LogicBaseOptions) {
    super(options);
    this.sdk = constructSimpleSDK({ chainId: this.chainId, axios });
    this.tokenTransferProxyAddress = getContractAddress(this.chainId, 'TokenTransferProxy');
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
    const output = new core.tokens.TokenAmount(tokenOut, destAmount);

    return output;
  }

  async getLogic(options: ParaswapV5SwapTokenLogicGetLogicOptions) {
    const { account, slippage, input, output, partner, partnerAddress } = options;

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
    const inputs = [rt.logics.newLogicInput({ input })];
    const outputs = [rt.logics.newLogicOutput({ output, slippage })];
    const approveTo = this.tokenTransferProxyAddress;

    return rt.logics.newLogic({ to, data, inputs, outputs, approveTo });
  }
}

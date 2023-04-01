import { BuildSwapTxInput, constructSimpleSDK } from '@paraswap/sdk';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { getContractAddress } from './config';

axiosRetry(axios, { retries: 5, retryDelay: axiosRetry.exponentialDelay });

export type SwapTokenLogicParams = core.TokenToTokenExactInParams;

export type SwapTokenLogicFields = core.TokenToTokenExactInFields<Pick<BuildSwapTxInput, 'partner' | 'partnerAddress'>>;

export type SwapTokenLogicOptions = Pick<core.GlobalOptions, 'account' | 'slippage'>;

@core.LogicDefinitionDecorator()
export class SwapTokenLogic extends core.Logic implements core.LogicOracleInterface {
  static readonly supportedChainIds = [
    common.ChainId.mainnet,
    common.ChainId.polygon,
    common.ChainId.arbitrum,
    common.ChainId.optimism,
    common.ChainId.avalanche,
  ];

  get sdk() {
    return constructSimpleSDK({ chainId: this.chainId, axios });
  }

  async quote(params: SwapTokenLogicParams) {
    const { input, tokenOut } = params;

    const { destAmount } = await this.sdk.swap.getRate({
      srcToken: input.token.elasticAddress,
      srcDecimals: input.token.decimals,
      amount: input.amountWei.toString(),
      destToken: tokenOut.elasticAddress,
      destDecimals: tokenOut.decimals,
    });
    const output = new common.TokenAmount(tokenOut).setWei(destAmount);

    return { input, output };
  }

  async build(fields: SwapTokenLogicFields, options: SwapTokenLogicOptions) {
    const { input, output, partner, partnerAddress } = fields;
    const { account, slippage } = options;

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
    const inputs = [core.newLogicInput({ input })];
    const approveTo = getContractAddress(this.chainId, 'TokenTransferProxy');

    return core.newLogic({ to, data, inputs, approveTo });
  }
}

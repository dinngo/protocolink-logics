import { StargatePool__factory } from './contracts';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { getDestChainIds, getEndpointId, getMarkets, getPoolByTokenAddress, supportedChainIds } from './configs';
import { getNativeToken } from '@protocolink/common';
import { utils } from 'ethers';

export type SwapTokenLogicTokenList = {
  srcToken: common.Token;
  destChainIds: number[];
}[];

export type SwapTokenLogicParams = core.TokenToTokenExactInParams<{
  receiver: string;
}>;

export type SwapTokenLogicFields = core.TokenToTokenExactInFields<{
  receiver: string;
  fee: string;
  lzTokenFee: string;
}>;

export type SwapTokenLogicOptions = Pick<core.GlobalOptions, 'account'>;

export class SwapTokenLogic extends core.Logic implements core.LogicBuilderInterface {
  static id = 'swap-token';
  static protocolId = 'stargate-v2';
  static readonly supportedChainIds = supportedChainIds;

  async getTokenList() {
    const tokenList: SwapTokenLogicTokenList = [];
    const srcTokens = [];

    const markets = getMarkets(this.chainId);
    for (const market of markets) {
      srcTokens.push(market.token);
    }

    // find destination chain ids
    for (const srcToken of srcTokens) {
      const destChainIds = getDestChainIds(this.chainId, srcToken);
      tokenList.push({ srcToken, destChainIds });
    }

    return tokenList;
  }

  public async quote(params: SwapTokenLogicParams) {
    const { input, tokenOut, receiver } = params;
    const dstEid = getEndpointId(tokenOut.chainId);
    const to = utils.hexZeroPad(utils.solidityPack(['address'], [receiver]), 32);
    const poolAddress = getPoolByTokenAddress(this.chainId, input.token.address);
    const amountLD = input.amountWei;
    const sendParam = {
      dstEid,
      to,
      amountLD,
      minAmountLD: amountLD,
      extraOptions: utils.solidityPack(['string'], ['']),
      composeMsg: utils.solidityPack(['string'], ['']),
      oftCmd: utils.solidityPack(['string'], ['']),
    };

    const stargate = StargatePool__factory.connect(poolAddress, this.provider);
    const [, , receipt] = await stargate.quoteOFT(sendParam);
    sendParam.minAmountLD = receipt.amountReceivedLD;

    const messagingFee = await stargate.quoteSend(sendParam, false);
    const fee = messagingFee.nativeFee;
    const lzTokenFee = messagingFee.lzTokenFee;

    const output = new common.TokenAmount(tokenOut).setWei(receipt.amountReceivedLD);

    return {
      input,
      output,
      fee: common.toBigUnit(fee, getNativeToken(this.chainId).decimals),
      lzTokenFee: common.toBigUnit(lzTokenFee, getNativeToken(this.chainId).decimals),
      receiver,
    };
  }

  async build(fields: SwapTokenLogicFields, options: SwapTokenLogicOptions) {
    const { input, output, fee, lzTokenFee, receiver, balanceBps } = fields;
    const { account } = options;
    const refundAddress = account;

    const to = getPoolByTokenAddress(this.chainId, input.token.address);
    const dstEid = getEndpointId(output.token.chainId);
    const amountLD = input.amountWei;
    const minAmountLD = output.amountWei;
    const sendParam = {
      dstEid,
      to: utils.hexZeroPad(utils.solidityPack(['address'], [receiver]), 32),
      amountLD,
      minAmountLD,
      extraOptions: utils.solidityPack(['string'], ['']),
      composeMsg: utils.solidityPack(['string'], ['']),
      oftCmd: utils.solidityPack(['string'], ['']),
    };

    const nativeToken = getNativeToken(this.chainId);
    const messagingFee = {
      nativeFee: new common.TokenAmount(nativeToken, fee).amountWei,
      lzTokenFee: new common.TokenAmount(nativeToken, lzTokenFee).amountWei,
    };

    const data = StargatePool__factory.createInterface().encodeFunctionData('sendToken', [
      sendParam,
      messagingFee,
      refundAddress,
    ]);

    const amountOffset = balanceBps ? common.getParamOffset(2) : undefined;

    const inputs = [
      core.newLogicInput({
        input: new common.TokenAmount(input.token, input.amount),
        balanceBps,
        amountOffset,
      }),
      core.newLogicInput({ input: new common.TokenAmount(getNativeToken(this.chainId), fee) }),
    ];

    // does not support unwrapBefore so users need to unwrap wrapped native token first
    const wrapMode = core.WrapMode.none;
    return core.newLogic({ to, data, inputs, wrapMode });
  }
}

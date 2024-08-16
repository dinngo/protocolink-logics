import { BigNumber, constants, utils } from 'ethers';
import { OFTWrapper__factory } from './contracts';
import {
  PoolId,
  getDestChainIds,
  getDestToken,
  getMarkets,
  getPoolConfigByTokenAddress,
  getStargateChainId,
  supportedChainIds,
} from './configs';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';

export type SwapTokenLogicTokenList = {
  srcToken: common.Token;
  destTokens: common.Token[];
}[];

export type SwapTokenLogicParams = core.TokenToTokenExactInParams<{
  receiver: string;
}>;

export type SwapTokenLogicFields = core.TokenToTokenExactInFields<{
  receiver: string;
  fee: string;
  // lzTokenFee: string;
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

    // find destination tokens
    for (const srcToken of srcTokens) {
      const destTokens: common.Token[] = [];

      const destChainIds = getDestChainIds(this.chainId, srcToken);
      for (const destChainId of destChainIds) {
        const destToken = getDestToken(srcToken, destChainId);
        destTokens.push(destToken);
      }
      tokenList.push({ srcToken, destTokens });
    }

    return tokenList;
  }

  public async quote(params: SwapTokenLogicParams) {
    const { input, tokenOut, receiver } = params;
    const pool = getPoolConfigByTokenAddress(input.token.chainId, input.token.address);

    let output = new common.TokenAmount(tokenOut);
    let fee = BigNumber.from('0');
    if (pool.id === PoolId.OFT) {
      const oftWrapper = OFTWrapper__factory.connect(pool.address, this.provider);
      const oft = pool.proxyOFT ? pool.proxyOFT : input.token.address;
      const destChainId = getStargateChainId(tokenOut.chainId);
      const srcAmount = input.amountWei;
      const adapterParameters = utils.solidityPack(['uint16', 'uint256'], [1, 200000]);
      const feeObj = {
        callerBps: 0,
        caller: constants.AddressZero,
        partnerId: utils.hexZeroPad(utils.solidityPack(['bytes'], [0]), 2),
      };

      [fee] = await oftWrapper.estimateSendFeeV2(
        oft,
        destChainId,
        utils.hexZeroPad(utils.solidityPack(['address'], [receiver]), 32),
        input.amountWei,
        false,
        adapterParameters,
        feeObj
      );
      fee = common.calcSlippage(fee, -1); // slightly higher than the quoted fee

      const [amount] = await oftWrapper.getAmountAndFees(oft, srcAmount, feeObj.callerBps);
      output = output.setWei(amount);
    }

    return {
      input,
      output,
      fee: common.toBigUnit(fee, common.getNativeToken(this.chainId).decimals),
      receiver,
    };
    //   } else {

    //   // check if tokenOut is legit
    //   const destToken = getDestToken(input.token, tokenOut.chainId);
    //   if (!tokenOut.is(destToken)) {
    //     return {
    //       input,
    //       output: new common.TokenAmount(tokenOut),
    //       fee: '0',
    //       lzTokenFee: '0',
    //       receiver,
    //     };
    //   }

    //   const dstEid = getEndpointId(tokenOut.chainId);
    //   const to = utils.hexZeroPad(utils.solidityPack(['address'], [receiver]), 32);
    //   const poolAddress = getPoolByTokenAddress(this.chainId, input.token.address);
    //   const amountLD = input.amountWei;
    //   const sendParam = {
    //     dstEid,
    //     to,
    //     amountLD,
    //     minAmountLD: amountLD,
    //     extraOptions: utils.solidityPack(['string'], ['']),
    //     composeMsg: utils.solidityPack(['string'], ['']),
    //     oftCmd: utils.solidityPack(['string'], ['']),
    //   };

    //   const stargate = StargatePool__factory.connect(poolAddress, this.provider);
    //   const [, , receipt] = await stargate.quoteOFT(sendParam);
    //   sendParam.minAmountLD = receipt.amountReceivedLD;

    //   const messagingFee = await stargate.quoteSend(sendParam, false);
    //   const fee = common.toBigUnit(messagingFee.nativeFee, getNativeToken(this.chainId).decimals),
    //   const lzTokenFee = common.toBigUnit(messagingFee.lzTokenFee, getNativeToken(this.chainId).decimals);
    //   const output = new common.TokenAmount(tokenOut).setWei(receipt.amountReceivedLD);
    // }
  }

  async build(fields: SwapTokenLogicFields, options: SwapTokenLogicOptions) {
    const { input, output, fee, /*lzTokenFee,*/ receiver, balanceBps } = fields;
    const { account } = options;
    const refundAddress = account;

    const pool = getPoolConfigByTokenAddress(input.token.chainId, input.token.address);
    const to = pool.address;

    const destChainId = getStargateChainId(output.token.chainId);
    const receiverBytes32 = utils.hexZeroPad(utils.solidityPack(['address'], [receiver]), 32);
    const amount = input.amountWei;
    const minAmount = output.amountWei;
    const adapterParams = utils.solidityPack(['uint16', 'uint256'], [1, 200000]);
    const lzCallParams = {
      refundAddress,
      zroPaymentAddress: constants.AddressZero,
      adapterParams,
    };
    const feeObj = {
      callerBps: 0,
      caller: constants.AddressZero,
      partnerId: utils.hexZeroPad(utils.solidityPack(['bytes'], [0]), 2),
    };
    const amountOffset = balanceBps ? common.getParamOffset(3) : undefined;

    let data = '';
    if (pool.proxyOFT) {
      data = OFTWrapper__factory.createInterface().encodeFunctionData('sendProxyOFTFeeV2', [
        pool.proxyOFT,
        destChainId,
        receiverBytes32,
        amount,
        minAmount,
        lzCallParams,
        feeObj,
      ]);
    } else if (pool.id == PoolId.OFT) {
      data = OFTWrapper__factory.createInterface().encodeFunctionData('sendOFTFeeV2', [
        input.token.address,
        destChainId,
        receiverBytes32,
        amount,
        minAmount,
        lzCallParams,
        feeObj,
      ]);
    }
    //  else {
    // const dstEid = getEndpointId(output.token.chainId);
    // const amountLD = input.amountWei;
    // const minAmountLD = output.amountWei;
    // const sendParam = {
    //   dstEid,
    //   to: utils.hexZeroPad(utils.solidityPack(['address'], [receiver]), 32),
    //   amountLD,
    //   minAmountLD,
    //   extraOptions: utils.solidityPack(['string'], ['']),
    //   composeMsg: utils.solidityPack(['string'], ['']),
    //   oftCmd: utils.solidityPack(['string'], ['']),
    // };
    // const nativeToken = getNativeToken(this.chainId);
    // const messagingFee = {
    //   nativeFee: new common.TokenAmount(nativeToken, fee).amountWei,
    //   lzTokenFee: new common.TokenAmount(nativeToken, lzTokenFee).amountWei,
    // };
    // const data = StargatePool__factory.createInterface().encodeFunctionData('sendToken', [
    //   sendParam,
    //   messagingFee,
    //   refundAddress,
    // ]);
    // does not support unwrapBefore so users need to unwrap wrapped native token first
    // }

    // const amountOffset = balanceBps ? common.getParamOffset(2) : undefined;

    const inputs = [
      core.newLogicInput({
        input: new common.TokenAmount(input.token, input.amount),
        balanceBps,
        amountOffset,
      }),
      core.newLogicInput({ input: new common.TokenAmount(common.getNativeToken(this.chainId), fee) }),
    ];

    const wrapMode = core.WrapMode.none;
    return core.newLogic({ to, data, inputs, wrapMode });
  }
}

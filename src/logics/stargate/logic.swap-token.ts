import { BigNumber, constants, utils } from 'ethers';
import {
  FeeLibrary__factory,
  LayerZeroEndpoint__factory,
  RouterETH__factory,
  Router__factory,
  StargateToken__factory,
} from './contracts';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import {
  getContractAddress,
  getDestChainIds,
  getDestTokens,
  getMarkets,
  getPoolDecimals,
  getPoolIds,
  getSTGToken,
  getStargateChainId,
  isSTGToken,
  supportedChainIds,
} from './configs';
import { getNativeToken } from '@protocolink/common';

export type SwapTokenLogicTokenList = {
  srcToken: common.Token;
  destTokenLists: {
    chainId: number;
    tokens: common.Token[];
  }[];
}[];

export type SwapTokenLogicParams = core.TokenToTokenExactInParams<{
  receiver: string;
  slippage?: number;
}>;

export type SwapTokenLogicFields = core.TokenToTokenExactInFields<{
  receiver: string;
  fee: string;
  slippage?: number;
}>;

export type SwapTokenLogicOptions = Pick<core.GlobalOptions, 'account'>;

export class SwapTokenLogic extends core.Logic implements core.LogicBuilderInterface {
  static id = 'swap-token';
  static protocolId = 'stargate';
  static readonly supportedChainIds = supportedChainIds;

  async getTokenList() {
    const tokenLists: SwapTokenLogicTokenList = [];
    const srcTokens = [];

    // collect src tokens
    const STG = getSTGToken(this.chainId);
    if (STG) {
      srcTokens.push(STG);
    }

    const markets = getMarkets(this.chainId);
    for (const market of markets) {
      srcTokens.push(market.token);
    }

    // find destination ids and tokens
    for (const srcToken of srcTokens) {
      const destTokenLists = [];

      const destChainIds = getDestChainIds(this.chainId, srcToken);
      for (const destChainId of destChainIds) {
        const destTokens = getDestTokens(this.chainId, srcToken, destChainId);
        destTokenLists.push({ chainId: destChainId, tokens: destTokens });
      }

      tokenLists.push({ srcToken, destTokenLists });
    }

    return tokenLists;
  }

  public async quote(params: SwapTokenLogicParams) {
    let output, fee;
    let feeBps = 0;

    const { input, tokenOut, receiver, slippage } = params;
    const destChainId = tokenOut.chainId;

    const destStargateChainId = getStargateChainId(destChainId);
    if (isSTGToken(this.chainId, input.token)) {
      const amountOut = input.amountWei;
      output = new common.TokenAmount(tokenOut, input.amount);

      const layerZeroEndpoint = LayerZeroEndpoint__factory.connect(
        getContractAddress(this.chainId, 'LayerZeroEndpoint'),
        this.provider
      );

      [fee] = await layerZeroEndpoint.estimateFees(
        destStargateChainId,
        input.token.address,
        utils.defaultAbiCoder.encode(['bytes', 'uint256'], [utils.solidityPack(['address'], [receiver]), amountOut]),
        false,
        utils.solidityPack(['uint16', 'uint256'], [1, 85000])
      );
    } else {
      const [srcPoolId, destPoolId] = getPoolIds(this.chainId, input.token, destChainId, tokenOut);
      const poolDecimals = getPoolDecimals(this.chainId, srcPoolId);
      const amountIn = common.toSmallUnit(input.amount, poolDecimals);

      const feeLibrary = FeeLibrary__factory.connect(getContractAddress(this.chainId, 'FeeLibrary'), this.provider);
      const { eqFee, eqReward, lpFee, protocolFee } = await feeLibrary.getFees(
        srcPoolId,
        destPoolId,
        getStargateChainId(destChainId),
        receiver,
        amountIn
      );
      const totalFee = eqFee.add(lpFee).add(protocolFee).sub(eqReward);
      let amountOut = amountIn.sub(totalFee);
      if (tokenOut.decimals !== poolDecimals) {
        amountOut = common.toSmallUnit(common.toBigUnit(amountOut, poolDecimals), tokenOut.decimals);
      }
      feeBps = totalFee.mul(10000).div(amountIn).toNumber();

      const router = Router__factory.connect(getContractAddress(this.chainId, 'Router'), this.provider);
      [fee] = await router.quoteLayerZeroFee(destStargateChainId, 1, receiver, '0x', {
        dstGasForCall: BigNumber.from(0), // extra gas, if calling smart contract,
        dstNativeAmount: 0, // amount of dust dropped in destination wallet
        dstNativeAddr: '0x', // destination wallet for dust
      });

      output = new common.TokenAmount(tokenOut).setWei(amountOut);
    }

    return {
      input,
      output,
      fee: common.toBigUnit(fee, getNativeToken(this.chainId).decimals),
      feeBps,
      receiver,
      slippage,
    };
  }

  async build(fields: SwapTokenLogicFields, options: SwapTokenLogicOptions) {
    const { input, output, fee, slippage, receiver, balanceBps } = fields;
    const destChainId = output.token.chainId;
    const { account } = options;
    const refundAddress = account;
    const amountIn = input.amountWei;
    const amountOutMin = slippage ? common.calcSlippage(output.amountWei, slippage) : output.amountWei;
    const destPayload = '0x'; // no payload
    const destStargateChainId = getStargateChainId(destChainId);

    let to, data, inputs;

    if (isSTGToken(this.chainId, input.token)) {
      to = input.token.address;
      data = StargateToken__factory.createInterface().encodeFunctionData('sendTokens', [
        destStargateChainId,
        receiver,
        amountIn,
        constants.AddressZero,
        utils.solidityPack(['uint16', 'uint256'], [1, 85000]), // adapterParameters {version, dstGas}
      ]);

      const amountOffset = balanceBps ? common.getParamOffset(2) : undefined;

      inputs = [
        core.newLogicInput({
          input: new common.TokenAmount(input.token.wrapped, input.amount),
          balanceBps,
          amountOffset,
        }),
        core.newLogicInput({ input: new common.TokenAmount(getNativeToken(this.chainId), fee) }),
      ];
    } else if (input.token.isNative && getContractAddress(this.chainId, 'RouterETH')) {
      to = getContractAddress(this.chainId, 'RouterETH');
      data = RouterETH__factory.createInterface().encodeFunctionData('swapETH', [
        destStargateChainId,
        refundAddress,
        receiver,
        amountIn,
        amountOutMin,
      ]);

      const amountOffset = balanceBps ? common.getParamOffset(3) : undefined;

      inputs = [
        core.newLogicInput({
          input: new common.TokenAmount(input.token.unwrapped, input.amount),
          balanceBps,
          amountOffset,
        }),
        core.newLogicInput({ input: new common.TokenAmount(getNativeToken(this.chainId), fee) }),
      ];
    } else {
      to = getContractAddress(this.chainId, 'Router');

      const [srcPoolId, destPoolId] = getPoolIds(this.chainId, input.token, destChainId, output.token);
      data = Router__factory.createInterface().encodeFunctionData('swap', [
        destStargateChainId,
        srcPoolId,
        destPoolId,
        refundAddress,
        amountIn,
        amountOutMin,
        {
          dstGasForCall: BigNumber.from(0), // extra gas, if calling smart contract,
          dstNativeAmount: 0, // amount of dust dropped in destination wallet
          dstNativeAddr: '0x', // destination wallet for dust
        },
        receiver,
        destPayload,
      ]);

      const amountOffset = balanceBps ? common.getParamOffset(4) : undefined;

      inputs = [
        core.newLogicInput({
          input: new common.TokenAmount(input.token.wrapped, input.amount),
          balanceBps,
          amountOffset,
        }),
        core.newLogicInput({ input: new common.TokenAmount(getNativeToken(this.chainId), fee) }),
      ];
    }

    const wrapMode = core.WrapMode.none;

    return core.newLogic({ to, data, inputs, wrapMode });
  }
}

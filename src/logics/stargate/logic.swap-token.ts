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
  getMarkets,
  getPoolIds,
  getStargateChainId,
  isSTGToken,
  supportedChainIds,
} from './configs';
import { getNativeToken } from '@protocolink/common';

export type SwapTokenLogicTokenList = Record<string, common.Token[]>;

export type SwapTokenLogicParams = core.TokenToTokenExactInParams<{
  dstChainId: number;
  receiver: string;
  slippage?: number;
}>;

export type SwapTokenLogicFields = core.TokenToTokenExactInFields<{
  dstChainId: number;
  receiver: string;
  fee: BigNumber;
  slippage?: number;
}>;

export type SwapTokenLogicOptions = Pick<core.GlobalOptions, 'account'>;

export class SwapTokenLogic extends core.Logic implements core.LogicBuilderInterface {
  static id = 'swap-token';
  static protocolId = 'stargate';
  static readonly supportedChainIds = supportedChainIds;

  async getTokenList() {
    const tokenList: SwapTokenLogicTokenList = {};

    const markets = getMarkets(this.chainId);
    for (const market of markets) {
      const token = market.token;
      tokenList[market.id] = [];
      if (token.isWrapped) {
        tokenList[market.id].push(market.token.unwrapped);
      }
      tokenList[market.id].push(token);
    }

    return tokenList;
  }

  public async quote(params: SwapTokenLogicParams) {
    let output, fee;
    let feeBps = 0;

    const { input, tokenOut, dstChainId, receiver, slippage } = params;

    const dstStargateChainId = getStargateChainId(dstChainId);
    if (isSTGToken(this.chainId, input.token)) {
      const amountOut = input.amountWei;
      output = input;

      const layerZeroEndpoint = LayerZeroEndpoint__factory.connect(
        getContractAddress(this.chainId, 'LayerZeroEndpoint'),
        this.provider
      );

      [fee] = await layerZeroEndpoint.estimateFees(
        dstStargateChainId,
        input.token.address,
        utils.defaultAbiCoder.encode(['bytes', 'uint256'], [utils.solidityPack(['address'], [receiver]), amountOut]),
        false,
        utils.solidityPack(['uint16', 'uint256'], [1, 85000])
      );
    } else {
      const [srcPoolId, dstPoolId] = getPoolIds(this.chainId, input.token, dstChainId, tokenOut);
      const amountIn = input.amountWei;

      const feeLibrary = FeeLibrary__factory.connect(getContractAddress(this.chainId, 'FeeLibrary'), this.provider);
      const { eqFee, eqReward, lpFee, protocolFee } = await feeLibrary.getFees(
        srcPoolId,
        dstPoolId,
        getStargateChainId(dstChainId),
        receiver,
        amountIn
      );
      const totalFee = eqFee.add(lpFee).add(protocolFee);
      output = new common.TokenAmount(tokenOut).setWei(amountIn.sub(totalFee).add(eqReward));
      feeBps = totalFee.mul(10000).div(amountIn).toNumber();

      const router = Router__factory.connect(getContractAddress(this.chainId, 'Router'), this.provider);
      [fee] = await router.quoteLayerZeroFee(dstStargateChainId, 1, receiver, '0x', {
        dstGasForCall: BigNumber.from(0), // extra gas, if calling smart contract,
        dstNativeAmount: 0, // amount of dust dropped in destination wallet
        dstNativeAddr: '0x', // destination wallet for dust
      });
    }

    return { input, output, fee, feeBps, dstChainId, receiver, slippage };
  }

  async build(fields: SwapTokenLogicFields, options: SwapTokenLogicOptions) {
    const { dstChainId, input, output, fee, slippage, receiver, balanceBps } = fields;
    const { account } = options;
    const refundAddress = account;
    const amountIn = input.amountWei;
    const amountOutMin = slippage ? common.calcSlippage(output.amountWei, slippage) : output.amountWei;
    const dstTo = utils.defaultAbiCoder.encode(['address'], [receiver]);
    const dstPayload = '0x'; // no payload
    const dstStargateChainId = getStargateChainId(dstChainId);

    let to, data, inputs;

    if (isSTGToken(this.chainId, input.token)) {
      to = input.token.address;
      data = StargateToken__factory.createInterface().encodeFunctionData('sendTokens', [
        dstStargateChainId,
        dstTo,
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
        core.newLogicInput({ input: new common.TokenAmount(getNativeToken(this.chainId)).setWei(fee) }),
      ];
    } else if (input.token.isNative && getContractAddress(this.chainId, 'RouterETH')) {
      to = getContractAddress(this.chainId, 'RouterETH');
      data = RouterETH__factory.createInterface().encodeFunctionData('swapETH', [
        dstStargateChainId,
        refundAddress,
        dstTo,
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
        core.newLogicInput({ input: new common.TokenAmount(getNativeToken(this.chainId)).setWei(fee) }),
      ];
    } else {
      to = getContractAddress(this.chainId, 'Router');

      const [srcPoolId, dstPoolId] = getPoolIds(this.chainId, input.token, dstChainId, output.token);
      data = Router__factory.createInterface().encodeFunctionData('swap', [
        dstStargateChainId,
        srcPoolId,
        dstPoolId,
        refundAddress,
        amountIn,
        amountOutMin,
        {
          dstGasForCall: BigNumber.from(0), // extra gas, if calling smart contract,
          dstNativeAmount: 0, // amount of dust dropped in destination wallet
          dstNativeAddr: '0x', // destination wallet for dust
        },
        dstTo,
        dstPayload,
      ]);

      const amountOffset = balanceBps ? common.getParamOffset(4) : undefined;

      inputs = [
        core.newLogicInput({
          input: new common.TokenAmount(input.token.wrapped, input.amount),
          balanceBps,
          amountOffset,
        }),
        core.newLogicInput({ input: new common.TokenAmount(getNativeToken(this.chainId)).setWei(fee) }),
      ];
    }

    const wrapMode = core.WrapMode.none;

    return core.newLogic({ to, data, inputs, wrapMode });
  }
}

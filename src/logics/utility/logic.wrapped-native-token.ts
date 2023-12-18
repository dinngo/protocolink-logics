import { BigNumberish } from 'ethers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';

export type WrappedNativeTokenLogicTokenList = [common.Token, common.Token][];

export type WrappedNativeTokenLogicParams = core.TokenToTokenExactInParams;

export type WrappedNativeTokenLogicFields = core.TokenToTokenExactInFields;

export class WrappedNativeTokenLogic
  extends core.Logic
  implements core.LogicTokenListInterface, core.LogicOracleInterface, core.LogicBuilderInterface
{
  static id = 'wrapped-native-token';
  static protocolId = 'utility';
  static readonly supportedChainIds = common.networks.map(({ chainId }) => chainId);

  getTokenList() {
    const tokenList: WrappedNativeTokenLogicTokenList = [
      [this.nativeToken, this.wrappedNativeToken],
      [this.wrappedNativeToken, this.nativeToken],
    ];

    return tokenList;
  }

  quote(params: WrappedNativeTokenLogicParams) {
    const { input, tokenOut } = params;
    const output = new common.TokenAmount(tokenOut, input.amount);

    return { input, output };
  }

  async build(fields: WrappedNativeTokenLogicFields) {
    const { input, balanceBps } = fields;

    const to = this.wrappedNativeToken.address;
    const iface = common.WETH__factory.createInterface();
    let data: string;
    let amountOffset: BigNumberish | undefined;
    if (input.token.isNative) {
      data = iface.encodeFunctionData('deposit');
      if (balanceBps) amountOffset = core.OFFSET_NOT_USED;
    } else {
      data = iface.encodeFunctionData('withdraw', [input.amountWei]);
      if (balanceBps) amountOffset = common.getParamOffset(0);
    }
    const inputs = [core.newLogicInput({ input, balanceBps, amountOffset })];

    return core.newLogic({ to, data, inputs });
  }
}

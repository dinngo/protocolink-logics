import { BigNumberish, constants } from 'ethers';
import * as common from '@furucombo/composable-router-common';
import * as core from '@furucombo/composable-router-core';

export type WrappedNativeTokenLogicTokenList = [common.Token, common.Token][];

export type WrappedNativeTokenLogicParams = core.TokenToTokenExactInParams;

export type WrappedNativeTokenLogicFields = core.TokenToTokenExactInFields;

@core.LogicDefinitionDecorator()
export class WrappedNativeTokenLogic
  extends core.Logic
  implements core.LogicTokenListInterface, core.LogicOracleInterface, core.LogicBuilderInterface
{
  static readonly supportedChainIds = [
    common.ChainId.mainnet,
    common.ChainId.polygon,
    common.ChainId.arbitrum,
    common.ChainId.optimism,
    common.ChainId.avalanche,
    common.ChainId.fantom,
  ];

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
    const { input, amountBps } = fields;

    const to = this.wrappedNativeToken.address;
    const iface = common.WETH__factory.createInterface();
    let data: string;
    let amountOffset: BigNumberish | undefined;
    if (input.token.isNative) {
      data = iface.encodeFunctionData('deposit');
      if (amountBps) amountOffset = constants.MaxUint256;
    } else {
      data = iface.encodeFunctionData('withdraw', [input.amountWei]);
      if (amountBps) amountOffset = common.getParamOffset(0);
    }
    const inputs = [core.newLogicInput({ input, amountBps, amountOffset })];

    return core.newLogic({ to, data, inputs });
  }
}

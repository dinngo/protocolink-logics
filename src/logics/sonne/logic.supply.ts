import { BigNumber } from 'ethers';
import { CErc20Immutable__factory } from './contracts';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { supportedChainIds, toCToken, tokenPairs } from './configs';

export type SupplyLogicTokenList = [common.Token, common.Token][];

export type SupplyLogicParams = core.TokenToTokenExactInParams;

export type SupplyLogicFields = core.TokenToTokenExactInFields;

export class SupplyLogic
  extends core.Logic
  implements core.LogicTokenListInterface, core.LogicOracleInterface, core.LogicBuilderInterface
{
  static id = 'supply';
  static protocolId = 'sonne';
  static readonly supportedChainIds = supportedChainIds;

  getTokenList() {
    const tokenList: SupplyLogicTokenList = tokenPairs[this.chainId].map(({ underlyingToken, cToken }) => [
      underlyingToken,
      cToken,
    ]);

    const nativeToken = common.getNativeToken(this.chainId);
    tokenList.push([nativeToken, toCToken(this.chainId, nativeToken)]);

    return tokenList;
  }

  async quote(params: SupplyLogicParams) {
    const { input, tokenOut } = params;

    const exchangeRateCurrent = await CErc20Immutable__factory.connect(
      tokenOut.address,
      this.provider
    ).callStatic.exchangeRateCurrent();
    const amountOutWei = input.amountWei.mul(BigNumber.from(10).pow(18)).div(exchangeRateCurrent);
    const output = new common.TokenAmount(tokenOut).setWei(amountOutWei);

    return { input, output };
  }

  async build(fields: SupplyLogicFields) {
    const { input, output, balanceBps } = fields;

    const tokenIn = input.token.wrapped;

    const to = output.token.address;
    const data = CErc20Immutable__factory.createInterface().encodeFunctionData('mint', [input.amountWei]);

    const amountOffset = balanceBps ? common.getParamOffset(0) : undefined;
    const inputs = [
      core.newLogicInput({
        input: new common.TokenAmount(tokenIn, input.amount),
        balanceBps,
        amountOffset,
      }),
    ];
    const wrapMode = input.token.isNative ? core.WrapMode.wrapBefore : core.WrapMode.none;

    return core.newLogic({ to, data, inputs, wrapMode });
  }
}

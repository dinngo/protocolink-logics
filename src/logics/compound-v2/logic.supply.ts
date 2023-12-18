import { BigNumber, BigNumberish } from 'ethers';
import { CErc20__factory, CEther__factory } from './contracts';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { supportedChainIds, tokenPairs } from './configs';

export type SupplyLogicTokenList = [common.Token, common.Token][];

export type SupplyLogicParams = core.TokenToTokenExactInParams;

export type SupplyLogicFields = core.TokenToTokenExactInFields;

export class SupplyLogic
  extends core.Logic
  implements core.LogicTokenListInterface, core.LogicOracleInterface, core.LogicBuilderInterface
{
  static id = 'supply';
  static protocolId = 'compound-v2';
  static readonly supportedChainIds = supportedChainIds;

  getTokenList() {
    const tokenList: SupplyLogicTokenList = tokenPairs.map(({ underlyingToken, cToken }) => [underlyingToken, cToken]);
    return tokenList;
  }

  async quote(params: SupplyLogicParams) {
    const { input, tokenOut } = params;

    const exchangeRateCurrent = await CErc20__factory.connect(
      tokenOut.address,
      this.provider
    ).callStatic.exchangeRateCurrent();
    const amountOutWei = input.amountWei.mul(BigNumber.from(10).pow(18)).div(exchangeRateCurrent);
    const output = new common.TokenAmount(tokenOut).setWei(amountOutWei);

    return { input, output };
  }

  async build(fields: SupplyLogicFields) {
    const { input, output, balanceBps } = fields;

    const to = output.token.address;
    let data: string;
    let amountOffset: BigNumberish | undefined;
    if (input.token.isNative) {
      data = CEther__factory.createInterface().encodeFunctionData('mint');
      if (balanceBps) amountOffset = core.OFFSET_NOT_USED;
    } else {
      data = CErc20__factory.createInterface().encodeFunctionData('mint', [input.amountWei]);
      if (balanceBps) amountOffset = common.getParamOffset(0);
    }
    const inputs = [core.newLogicInput({ input, balanceBps, amountOffset })];

    return core.newLogic({ to, data, inputs });
  }
}

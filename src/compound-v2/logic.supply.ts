import { BigNumber, BigNumberish, constants } from 'ethers';
import { CErc20__factory, CEther__factory } from './contracts';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { tokenPairs } from './tokens';

export type SupplyLogicParams = core.TokenToTokenExactInParams;

export type SupplyLogicFields = core.TokenToTokenExactInFields;

@core.LogicDefinitionDecorator()
export class SupplyLogic extends core.Logic implements core.LogicTokenListInterface, core.LogicOracleInterface {
  static readonly supportedChainIds = [common.ChainId.mainnet];

  getTokenList() {
    return tokenPairs.map((tokenPair) => [tokenPair.underlyingToken, tokenPair.cToken]);
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
    const { input, output, amountBps } = fields;

    const to = output.token.address;
    let data: string;
    let amountOffset: BigNumberish | undefined;
    if (input.token.isNative) {
      data = CEther__factory.createInterface().encodeFunctionData('mint');
      if (amountBps) amountOffset = constants.MaxUint256;
    } else {
      data = CErc20__factory.createInterface().encodeFunctionData('mint', [input.amountWei]);
      if (amountBps) amountOffset = common.getParamOffset(0);
    }
    const inputs = [core.newLogicInput({ input, amountBps, amountOffset })];

    return core.newLogic({ to, data, inputs });
  }
}

import { AaveV2Service } from './service';
import { LendingPool__factory } from './contracts';
import { constants } from 'ethers';
import * as core from 'src/core';
import invariant from 'tiny-invariant';
import * as rt from 'src/router';

export type AaveV2WithdrawLogicGetPriceOptions = rt.logics.TokenToTokenExactInData;

export type AaveV2WithdrawLogicGetLogicOptions = rt.logics.TokenToTokenData &
  Pick<rt.RouterGlobalOptions, 'routerAddress'>;

export class AaveV2WithdrawLogic extends rt.logics.LogicBase implements rt.logics.TokenToTokenLogicInterface {
  service: AaveV2Service;

  constructor(options: rt.logics.LogicBaseOptions) {
    super(options);
    this.service = new AaveV2Service(options);
  }

  async getPrice(options: AaveV2WithdrawLogicGetPriceOptions) {
    const { input, tokenOut } = options;
    invariant(!tokenOut.isNative(), 'tokenOut should not be native token');

    const output = new core.tokens.TokenAmount(tokenOut, input.amount);

    return output;
  }

  async getLogic(options: AaveV2WithdrawLogicGetLogicOptions) {
    const { input, output, amountBps, routerAddress } = options;
    invariant(!output.token.isNative(), 'tokenOut should not be native token');

    const to = await this.service.getLendingPoolAddress();
    const data = LendingPool__factory.createInterface().encodeFunctionData('withdraw', [
      output.token.address,
      input.amountWei,
      routerAddress,
    ]);
    const logicInput = rt.logics.newLogicInput({
      input,
      ...(amountBps ? { amountBps, amountOffset: core.utils.getParamOffset(1) } : {}),
    });

    return { to, data, inputs: [logicInput], outputs: [], callback: constants.AddressZero };
  }
}

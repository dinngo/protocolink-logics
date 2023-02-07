import { AaveV2Service } from './service';
import { LendingPool__factory, WETHGateway__factory } from './contracts';
import { constants } from 'ethers';
import * as core from 'src/core';
import * as rt from 'src/router';

export type AaveV2WithdrawLogicGetPriceOptions = rt.logics.TokenToTokenExactInData;

export type AaveV2WithdrawLogicGetLogicOptions = rt.logics.TokenToTokenData &
  Pick<rt.RouterGlobalOptions, 'routerAddress'> & { referralCode?: number };

export class AaveV2WithdrawLogic extends rt.logics.LogicBase implements rt.logics.TokenToTokenLogicInterface {
  service: AaveV2Service;

  constructor(options: rt.logics.LogicBaseOptions) {
    super(options);
    this.service = new AaveV2Service(options);
  }

  async getPrice(options: AaveV2WithdrawLogicGetPriceOptions) {
    const { input, tokenOut } = options;
    const output = new core.tokens.TokenAmount(tokenOut, input.amount);
    return output;
  }

  async getLogic(options: AaveV2WithdrawLogicGetLogicOptions) {
    const { input, output, routerAddress } = options;

    const lendingPoolAddress = await this.service.getLendingPoolAddress();
    const wethGatewayAddress = await this.service.getWETHGatewayAddress();

    let to: string;
    let data: string;
    if (output.token.isNative()) {
      to = wethGatewayAddress;
      data = WETHGateway__factory.createInterface().encodeFunctionData('withdrawETH', [
        lendingPoolAddress,
        output.amountWei,
        routerAddress,
      ]);
    } else {
      to = lendingPoolAddress;
      data = LendingPool__factory.createInterface().encodeFunctionData('withdraw', [
        output.token.address,
        output.amountWei,
        routerAddress,
      ]);
    }

    return { to, data, inputs: [rt.logics.newLogicInput({ input })], outputs: [], callback: constants.AddressZero };
  }
}

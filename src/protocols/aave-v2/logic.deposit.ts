import { LendingPool__factory, WETHGateway__factory } from './contracts';
import { constants } from 'ethers';
import * as core from 'src/core';
import { getContractAddress } from './config';
import * as rt from 'src/router';

export type AaveV2DepositLogicGetPriceOptions = rt.logics.TokenToTokenExactInData;

export type AaveV2DepositLogicGetLogicOptions = rt.logics.TokenToTokenData &
  Pick<rt.RouterGlobalOptions, 'routerAddress'> & { referralCode?: number };

export class AaveV2DepositLogic extends rt.logics.LogicBase implements rt.logics.TokenToTokenLogicInterface {
  async getPrice(options: AaveV2DepositLogicGetPriceOptions) {
    const { input, tokenOut } = options;
    const output = new core.tokens.TokenAmount(tokenOut, input.amount);
    return output;
  }

  async getLogic(options: AaveV2DepositLogicGetLogicOptions) {
    const { input, routerAddress, referralCode = 0 } = options;

    let to: string;
    let data: string;
    if (input.token.isNative()) {
      to = getContractAddress(this.chainId, 'WETHGateway');
      data = WETHGateway__factory.createInterface().encodeFunctionData('depositETH', [
        getContractAddress(this.chainId, 'LendingPool'),
        routerAddress,
        referralCode,
      ]);
    } else {
      to = getContractAddress(this.chainId, 'LendingPool');
      data = LendingPool__factory.createInterface().encodeFunctionData('deposit', [
        input.token.address,
        input.amountWei,
        routerAddress,
        referralCode,
      ]);
    }

    return { to, data, inputs: [rt.logics.newLogicInput({ input })], outputs: [], callback: constants.AddressZero };
  }
}

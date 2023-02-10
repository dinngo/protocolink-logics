import { AaveV2Service } from './service';
import { BigNumberish, constants } from 'ethers';
import { InterestRateMode } from './types';
import { LendingPool__factory } from './contracts';
import * as rt from 'src/router';

export type AaveV2FlashLoanLogicGetLogicOptions = rt.logics.TokensOutData & { params: string; referralCode?: number };

export class AaveV2FlashLoanLogic extends rt.logics.LogicBase {
  service: AaveV2Service;
  callbackAddress: string;

  constructor(options: rt.logics.LogicBaseOptions<{ callbackAddress?: string }>) {
    const { chainId, provider, callbackAddress } = options;
    super({ chainId, provider });
    this.service = new AaveV2Service({ chainId, provider });
    this.callbackAddress = callbackAddress ?? rt.config.getContractAddress(chainId, 'FlashLoanCallbackAaveV2');
  }

  async getLogic(options: AaveV2FlashLoanLogicGetLogicOptions) {
    const { outputs, params, referralCode = 0 } = options;

    const assets: string[] = [];
    const amounts: BigNumberish[] = [];
    const modes: number[] = [];
    for (const output of outputs) {
      assets.push(output.token.address);
      amounts.push(output.amountWei);
      modes.push(InterestRateMode.none);
    }

    const to = await this.service.getLendingPoolAddress();
    const data = LendingPool__factory.createInterface().encodeFunctionData('flashLoan', [
      this.callbackAddress,
      assets,
      amounts,
      modes,
      constants.AddressZero,
      params,
      referralCode,
    ]);

    return { to, data, inputs: [], outputs: [], callback: this.callbackAddress };
  }
}

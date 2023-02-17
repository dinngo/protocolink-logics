import { BigNumberish } from 'ethers';
import { Vault__factory } from './contracts';
import * as core from 'src/core';
import { getContractAddress } from './config';
import * as rt from 'src/router';

export type BalancerV2FlashLoanLogicGetLogicOptions = rt.logics.TokensOutData & { userData: string };

export class BalancerV2FlashLoanLogic extends rt.logics.LogicBase {
  callbackAddress: string;

  constructor(options: rt.logics.LogicBaseOptions<{ callbackAddress?: string }>) {
    const { chainId, provider, callbackAddress } = options;
    super({ chainId, provider });
    this.callbackAddress = callbackAddress ?? getContractAddress(chainId, 'FlashLoanCallbackBalancerV2');
  }

  async getLogic(options: BalancerV2FlashLoanLogicGetLogicOptions) {
    const { outputs, userData } = options;

    const to = await getContractAddress(this.chainId, 'Vault');

    const assets: string[] = [];
    const amounts: BigNumberish[] = [];
    for (const output of core.tokens.TokenAmount.sortByAddress(outputs)) {
      assets.push(output.token.address);
      amounts.push(output.amountWei);
    }
    const data = Vault__factory.createInterface().encodeFunctionData('flashLoan', [
      this.callbackAddress,
      assets,
      amounts,
      userData,
    ]);

    const callback = this.callbackAddress;

    return rt.logics.newLogic({ to, data, callback });
  }
}

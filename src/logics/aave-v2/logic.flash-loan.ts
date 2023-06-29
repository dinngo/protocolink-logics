import { BigNumberish, constants } from 'ethers';
import { InterestRateMode } from './types';
import { LendingPool__factory } from './contracts';
import { Service } from './service';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { getContractAddress, supportedChainIds } from './configs';

export type FlashLoanLogicTokenList = common.Token[];

export type FlashLoanLogicFields = core.FlashLoanFields<{ referralCode?: number }>;

@core.LogicDefinitionDecorator()
export class FlashLoanLogic extends core.Logic implements core.LogicTokenListInterface, core.LogicBuilderInterface {
  static readonly supportedChainIds = supportedChainIds;

  async getTokenList() {
    const service = new Service(this.chainId, this.provider);
    const tokens: FlashLoanLogicTokenList = await service.getAssets();

    return tokens;
  }

  async build(fields: FlashLoanLogicFields) {
    const { outputs, params, referralCode = 0 } = fields;

    const service = new Service(this.chainId, this.provider);
    const to = await service.getLendingPoolAddress();

    const assets: string[] = [];
    const amounts: BigNumberish[] = [];
    const modes: number[] = [];
    outputs.forEach((output) => {
      assets.push(output.token.address);
      amounts.push(output.amountWei);
      modes.push(InterestRateMode.none);
    });
    const data = LendingPool__factory.createInterface().encodeFunctionData('flashLoan', [
      getContractAddress(this.chainId, 'AaveV2FlashLoanCallback'),
      assets,
      amounts,
      modes,
      constants.AddressZero,
      params,
      referralCode,
    ]);

    const callback = getContractAddress(this.chainId, 'AaveV2FlashLoanCallback');

    return core.newLogic({ to, data, callback });
  }
}

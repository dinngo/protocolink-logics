import { BigNumberish } from 'ethers';
import { Vault__factory } from './contracts';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { getContractAddress } from './config';

export type FlashLoanLogicFields = core.FlashLoanFields;

@core.LogicDefinitionDecorator()
export class FlashLoanLogic extends core.Logic {
  static readonly supportedChainIds = [
    common.ChainId.mainnet,
    common.ChainId.polygon,
    common.ChainId.arbitrum,
    common.ChainId.optimism,
  ];

  async getLogic(fields: FlashLoanLogicFields) {
    const { outputs, params } = fields;

    const to = getContractAddress(this.chainId, 'Vault');

    const assets: string[] = [];
    const amounts: BigNumberish[] = [];
    for (const output of common.sortByAddress(outputs.toArray())) {
      assets.push(output.token.address);
      amounts.push(output.amountWei);
    }
    const data = Vault__factory.createInterface().encodeFunctionData('flashLoan', [
      getContractAddress(this.chainId, 'FlashLoanCallbackBalancerV2'),
      assets,
      amounts,
      params,
    ]);

    const callback = getContractAddress(this.chainId, 'FlashLoanCallbackBalancerV2');

    return core.newLogic({ to, data, callback });
  }
}

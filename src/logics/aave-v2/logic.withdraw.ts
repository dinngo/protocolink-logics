import { Service } from './service';
import * as aavev2 from 'src/modules/aavev2';
import * as core from '@protocolink/core';
import { protocolId, supportedChainIds } from './configs';
import { providers } from 'ethers';

export type WithdrawLogicTokenList = aavev2.WithdrawLogicTokenList;

export type WithdrawLogicParams = aavev2.WithdrawLogicParams;

export type WithdrawLogicFields = aavev2.WithdrawLogicFields;

export type WithdrawLogicOptions = aavev2.WithdrawLogicOptions;

export class WithdrawLogic
  extends aavev2.WithdrawLogic
  implements core.LogicTokenListInterface, core.LogicOracleInterface, core.LogicBuilderInterface
{
  static protocolId = protocolId;
  static readonly supportedChainIds = supportedChainIds;

  constructor(chainId: number, provider?: providers.Provider) {
    super({ chainId, provider, service: new Service(chainId, provider) });
  }

  async getTokenList() {
    const reserveTokens = await this.service.getSupplyTokens();

    return aavev2.createWithdrawTokenList(reserveTokens, 'aToken');
  }
}

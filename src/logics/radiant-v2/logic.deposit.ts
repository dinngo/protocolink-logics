import { Service } from './service';
import * as aavev2 from 'src/modules/aavev2';
import { protocolId, supportedChainIds } from './configs';
import { providers } from 'ethers';

export type DepositLogicTokenList = aavev2.DepositLogicTokenList;

export type DepositLogicParams = aavev2.DepositLogicParams;

export type DepositLogicFields = aavev2.DepositLogicFields;

export type DepositLogicOptions = aavev2.DepositLogicOptions;

export class DepositLogic extends aavev2.DepositLogics {
  static protocolId = protocolId;
  static readonly supportedChainIds = supportedChainIds;

  constructor(chainId: number, provider?: providers.Provider) {
    super({ chainId, provider, service: new Service(chainId, provider) });
  }

  async getTokenList() {
    const reserveTokens = await this.service.getSupplyTokens();

    return aavev2.createDepositTokenList(reserveTokens, 'rToken');
  }
}

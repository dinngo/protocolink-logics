import { Service } from './service';
import * as aavev2 from 'src/modules/aavev2';
import { protocolId, supportedChainIds } from './configs';
import { providers } from 'ethers';

export type RepayLogicTokenList = aavev2.RepayLogicTokenList;

export type RepayLogicParams = aavev2.RepayLogicParams;

export type RepayLogicFields = aavev2.RepayLogicFields;

export class RepayLogic extends aavev2.RepayLogic {
  static protocolId = protocolId;
  static readonly supportedChainIds = supportedChainIds;

  constructor(chainId: number, provider?: providers.Provider) {
    super({ chainId, provider, service: new Service(chainId, provider) });
  }
}

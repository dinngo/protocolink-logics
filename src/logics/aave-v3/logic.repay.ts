import { Service } from './service';
import * as aavev3 from 'src/modules/aavev3';
import { protocolId, supportedChainIds } from './configs';
import { providers } from 'ethers';

export type RepayLogicTokenList = aavev3.RepayLogicTokenList;

export type RepayLogicParams = aavev3.RepayLogicParams;

export type RepayLogicFields = aavev3.RepayLogicFields;

export class RepayLogic extends aavev3.RepayLogic {
  static protocolId = protocolId;
  static readonly supportedChainIds = supportedChainIds;

  constructor(chainId: number, provider?: providers.Provider) {
    super({ chainId, provider, service: new Service(chainId, provider) });
  }
}

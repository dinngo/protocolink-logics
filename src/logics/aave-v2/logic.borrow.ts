import { Service } from './service';
import * as aavev2 from 'src/modules/aavev2';
import { protocolId, supportedChainIds } from './configs';
import { providers } from 'ethers';

export type BorrowLogicFields = aavev2.BorrowLogicFields;

export type BorrowLogicOptions = aavev2.BorrowLogicOptions;

export type BorrowLogicTokenList = aavev2.BorrowLogicTokenList;

export class BorrowLogic extends aavev2.BorrowLogic {
  static protocolId = protocolId;
  static readonly supportedChainIds = supportedChainIds;

  constructor(chainId: number, provider?: providers.Provider) {
    super({ chainId, provider, service: new Service(chainId, provider) });
  }
}

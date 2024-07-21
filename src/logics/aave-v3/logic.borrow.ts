import { Service } from './service';
import * as aavev3 from 'src/modules/aavev3';
import { protocolId, supportedChainIds } from './configs';
import { providers } from 'ethers';

export type BorrowLogicTokenList = aavev3.BorrowLogicTokenList;

export type BorrowLogicFields = aavev3.BorrowLogicFields;

export type BorrowLogicOptions = aavev3.BorrowLogicOptions;

export class BorrowLogic extends aavev3.BorrowLogic {
  static protocolId = protocolId;
  static readonly supportedChainIds = supportedChainIds;

  constructor(chainId: number, provider?: providers.Provider) {
    super({ chainId, provider, service: new Service(chainId, provider) });
  }
}

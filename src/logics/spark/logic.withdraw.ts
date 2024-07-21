import { Service } from './service';
import * as aavev3 from 'src/modules/aavev3';
import { protocolId, supportedChainIds } from './configs';
import { providers } from 'ethers';

export type WithdrawLogicTokenList = aavev3.WithdrawLogicTokenList;

export type WithdrawLogicParams = aavev3.WithdrawLogicParams;

export type WithdrawLogicFields = aavev3.WithdrawLogicFields;

export type WithdrawLogicOptions = aavev3.WithdrawLogicOptions;

export class WithdrawLogic extends aavev3.WithdrawLogic {
  static protocolId = protocolId;
  static readonly supportedChainIds = supportedChainIds;

  constructor(chainId: number, provider?: providers.Provider) {
    super({ chainId, provider, service: new Service(chainId, provider) });
  }
}

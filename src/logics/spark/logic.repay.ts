import { Service } from './service';
import * as aavev3 from 'src/modules/aavev3';
import * as core from '@protocolink/core';
import { protocolId, supportedChainIds } from './configs';
import { providers } from 'ethers';

export type RepayLogicTokenList = aavev3.RepayLogicTokenList;

export type RepayLogicParams = aavev3.RepayLogicParams;

export type RepayLogicFields = aavev3.RepayLogicFields;

export class RepayLogic
  extends aavev3.RepayLogic
  implements core.LogicTokenListInterface, core.LogicOracleInterface, core.LogicBuilderInterface
{
  static protocolId = protocolId;
  static readonly supportedChainIds = supportedChainIds;

  constructor(chainId: number, provider?: providers.Provider) {
    super({ chainId, provider, service: new Service(chainId, provider) });
  }
}

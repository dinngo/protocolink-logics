import { Service } from './service';
import * as aavev2 from 'src/modules/aavev2';
import * as core from '@protocolink/core';
import { protocolId, supportedChainIds } from './configs';
import { providers } from 'ethers';

export type RepayLogicTokenList = aavev2.RepayLogicTokenList;

export type RepayLogicParams = aavev2.RepayLogicParams;

export type RepayLogicFields = aavev2.RepayLogicFields;

export class RepayLogic
  extends aavev2.RepayLogic
  implements core.LogicTokenListInterface, core.LogicOracleInterface, core.LogicBuilderInterface
{
  static protocolId = protocolId;
  static readonly supportedChainIds = supportedChainIds;

  constructor(chainId: number, provider?: providers.Provider) {
    super({ chainId, provider, service: new Service(chainId, provider) });
  }
}

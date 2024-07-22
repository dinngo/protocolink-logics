import { Service } from './service';
import * as aavev3 from 'src/modules/aavev3';
import * as core from '@protocolink/core';
import { protocolId, supportedChainIds } from './configs';
import { providers } from 'ethers';

export type SupplyLogicTokenList = aavev3.SupplyLogicTokenList;

export type SupplyLogicParams = aavev3.SupplyLogicParams;

export type SupplyLogicFields = aavev3.SupplyLogicFields;

export type SupplyLogicOptions = aavev3.SupplyLogicOptions;

export class SupplyLogic
  extends aavev3.SupplyLogics
  implements core.LogicTokenListInterface, core.LogicOracleInterface, core.LogicBuilderInterface
{
  static protocolId = protocolId;
  static readonly supportedChainIds = supportedChainIds;

  constructor(chainId: number, provider?: providers.Provider) {
    super({ chainId, provider, service: new Service(chainId, provider) });
  }
}

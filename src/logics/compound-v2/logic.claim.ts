import { COMP, getContractAddress, supportedChainIds } from './configs';
import { CompoundLens__factory, Comptroller__factory } from './contracts';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';

export type ClaimLogicTokenList = [common.Token];

export type ClaimLogicParams = core.ClaimParams;

export type ClaimLogicFields = core.ClaimFields;

export class ClaimLogic
  extends core.Logic
  implements core.LogicTokenListInterface, core.LogicOracleInterface, core.LogicBuilderInterface
{
  static id = 'claim';
  static protocolId = 'compound-v2';
  static readonly supportedChainIds = supportedChainIds;

  getTokenList() {
    const tokenList: ClaimLogicTokenList = [COMP];
    return tokenList;
  }

  async quote(params: ClaimLogicParams) {
    const metadata = await CompoundLens__factory.connect(
      getContractAddress('CompoundLens'),
      this.provider
    ).callStatic.getCompBalanceMetadataExt(COMP.address, getContractAddress('Comptroller'), params.owner);
    const output = new common.TokenAmount(COMP).setWei(metadata.allocated);

    return { output };
  }

  async build(fields: ClaimLogicFields) {
    const { owner } = fields;

    const to = getContractAddress('Comptroller');
    const data = Comptroller__factory.createInterface().encodeFunctionData('claimComp(address)', [owner]);

    return core.newLogic({ to, data });
  }
}

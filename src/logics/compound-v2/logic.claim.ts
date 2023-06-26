import { COMP } from './tokens';
import { CompoundLens__factory, Comptroller__factory } from './contracts';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { getContractAddress } from './config';

export type ClaimLogicTokenList = [common.Token];

export type ClaimLogicParams = core.ClaimParams;

export type ClaimLogicFields = core.ClaimFields;

@core.LogicDefinitionDecorator()
export class ClaimLogic
  extends core.Logic
  implements core.LogicTokenListInterface, core.LogicOracleInterface, core.LogicBuilderInterface
{
  static readonly supportedChainIds = [common.ChainId.mainnet];

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

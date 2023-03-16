import { COMP } from './tokens';
import { CompoundLens__factory, Comptroller__factory } from './contracts';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { getContractAddress } from './config';

export type ClaimCOMPLogicFields = core.ClaimTokenFields;

@core.LogicDefinitionDecorator()
export class ClaimCOMPLogic extends core.Logic implements core.LogicTokenListInterface {
  static readonly supportedChainIds = [common.ChainId.mainnet];

  getTokenList() {
    return [COMP];
  }

  async getReward(owner: string) {
    const compoundLens = CompoundLens__factory.connect(getContractAddress('CompoundLens'), this.provider);
    const metadata = await compoundLens.callStatic.getCompBalanceMetadataExt(
      COMP.address,
      getContractAddress('Comptroller'),
      owner
    );
    const output = new common.TokenAmount(COMP).setWei(metadata.allocated);

    return output;
  }

  async getLogic(fields: ClaimCOMPLogicFields) {
    const { owner } = fields;

    const to = getContractAddress('Comptroller');
    const data = Comptroller__factory.createInterface().encodeFunctionData('claimComp(address)', [owner]);

    return core.newLogic({ to, data });
  }
}

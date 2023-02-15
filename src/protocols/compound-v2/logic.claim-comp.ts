import { COMP } from './tokens';
import { CompoundLens__factory, Comptroller__factory } from './contracts';
import * as core from 'src/core';
import { getContractAddress } from './config';
import * as rt from 'src/router';

export type CompoundV2ClaimCOMPLogicGetPriceOptions = { holder: string };

export type CompoundV2ClaimCOMPLogicGetLogicOptions = { holder: string };

export class CompoundV2ClaimCOMPLogic extends rt.logics.LogicBase {
  async getPrice(options: CompoundV2ClaimCOMPLogicGetPriceOptions) {
    const { holder } = options;

    const compoundLens = CompoundLens__factory.connect(getContractAddress('CompoundLens'), this.provider);
    const metadata = await compoundLens.callStatic.getCompBalanceMetadataExt(
      COMP.address,
      getContractAddress('Comptroller'),
      holder
    );
    const output = new core.tokens.TokenAmount(COMP).setWei(metadata.allocated);

    return output;
  }

  async getLogic(options: CompoundV2ClaimCOMPLogicGetLogicOptions) {
    const { holder } = options;

    const to = getContractAddress('Comptroller');
    const data = Comptroller__factory.createInterface().encodeFunctionData('claimComp(address)', [holder]);

    return rt.logics.newLogic({ to, data });
  }
}

import { Comptroller__factory } from './contracts';
import { getContractAddress } from './config';
import * as rt from 'src/router';

export type CompoundV2ClaimCOMPLogicGetPriceOptions = rt.logics.TokenToTokenExactInData;

export type CompoundV2ClaimCOMPLogicGetLogicOptions = { holder: string };

export class CompoundV2ClaimCOMPLogic extends rt.logics.LogicBase {
  async getLogic(options: CompoundV2ClaimCOMPLogicGetLogicOptions) {
    const { holder } = options;

    const to = getContractAddress('Comptroller');
    const data = Comptroller__factory.createInterface().encodeFunctionData('claimComp(address)', [holder]);

    return rt.logics.newLogic({ to, data });
  }
}

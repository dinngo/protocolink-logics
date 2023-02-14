import { CompoundV2Service } from './service';
import { Comptroller__factory } from './contracts';
import { getContractAddress } from './config';
import * as rt from 'src/router';

export type CompoundV2ClaimCOMPLogicGetPriceOptions = { holder: string };

export type CompoundV2ClaimCOMPLogicGetLogicOptions = { holder: string };

export class CompoundV2ClaimCOMPLogic extends rt.logics.LogicBase {
  async getPrice(options: CompoundV2ClaimCOMPLogicGetPriceOptions) {
    const { holder } = options;

    const service = new CompoundV2Service({ provider: this.provider });
    const allocatedCOMP = await service.getAllocatedCOMP(holder);

    return allocatedCOMP;
  }

  async getLogic(options: CompoundV2ClaimCOMPLogicGetLogicOptions) {
    const { holder } = options;

    const to = getContractAddress('Comptroller');
    const data = Comptroller__factory.createInterface().encodeFunctionData('claimComp(address)', [holder]);

    return rt.logics.newLogic({ to, data });
  }
}

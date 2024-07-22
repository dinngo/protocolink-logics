import { Service as AaveV2Service } from 'src/logics/aave-v2';
import { Service as RadiantV2Service } from 'src/logics/radiant-v2';
import { providers } from 'ethers';

export enum InterestRateMode {
  none = 0,
  stable = 1,
  variable = 2,
}

export type serviceType = AaveV2Service | RadiantV2Service;

export interface LogicOptions {
  chainId: number;
  provider?: providers.Provider;
  service: serviceType;
}

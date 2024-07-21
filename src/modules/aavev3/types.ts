import { Service as AaveV3Service } from 'src/logics/aave-v3';
import { Service as SparkService } from 'src/logics/spark';
import { providers } from 'ethers';

export enum InterestRateMode {
  none = 0,
  stable = 1,
  variable = 2,
}

export type serviceType = AaveV3Service | SparkService;

export interface LogicOptions {
  chainId: number;
  provider?: providers.Provider;
  service: serviceType;
}

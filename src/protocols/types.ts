import { NetworkConfig } from '../core/network';

export interface ProtocolLogic {
  id: string;
  supportedNetworks: NetworkConfig[];
}

export interface ProtocolDefinition {
  id: string;
  name: string;
  description?: string;
  url?: string;
  logics: ProtocolLogic[];
}

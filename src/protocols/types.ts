import * as core from 'src/core';

export interface ProtocolLogic {
  id: string;
  supportedNetworks: core.network.NetworkConfig[];
}

export interface ProtocolDefinition {
  id: string;
  name: string;
  description?: string;
  url?: string;
  logics: ProtocolLogic[];
}

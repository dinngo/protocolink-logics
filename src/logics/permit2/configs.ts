import * as core from '@protocolink/core';

export const supportedChainIds = Object.keys(core.contractAddressMap).map((chainId) => Number(chainId));

import * as common from '@protocolink/common';

if (process.env.CHAIN_ID && process.env.HTTP_RPC_URL) {
  common.setNetwork(parseInt(process.env.CHAIN_ID), { rpcUrl: process.env.HTTP_RPC_URL });
} else if (process.env.MAINNET_RPC_URL) {
  common.setNetwork(common.ChainId.mainnet, { rpcUrl: process.env.MAINNET_RPC_URL });
} else {
  common.setNetwork(common.ChainId.mainnet, { rpcUrl: 'https://eth.llamarpc.com' });
}

import '@nomicfoundation/hardhat-chai-matchers';
import '@furucombo/composable-router-test-helpers';

import { HardhatUserConfig } from 'hardhat/config';
import * as common from '@furucombo/composable-router-common';
import { setup } from 'test/hooks';

const chainId = process.env.CHAIN_ID ? parseInt(process.env.CHAIN_ID) : common.ChainId.mainnet;
const network = common.getNetwork(chainId);

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      chainId,
      gasPrice: 0,
      initialBaseFeePerGas: 0,
      accounts: {
        mnemonic: 'test test test test test test test test test test test logic',
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
      },
      forking: {
        url: network.rpcUrl,
      },
    },
  },
  paths: {
    tests: `test/logics/${network.id}`,
  },
  mocha: {
    timeout: 1200000,
    retries: 3,
    rootHooks: { beforeAll: [setup] },
  },
};

export default config;

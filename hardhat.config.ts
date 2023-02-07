import '@nomicfoundation/hardhat-chai-matchers';
import '@typechain/hardhat';
import 'tsconfig-paths/register';
import 'test/chai-matchers';

import { HardhatUserConfig } from 'hardhat/config';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.17',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      gasPrice: 0,
      initialBaseFeePerGas: 0,
      accounts: {
        mnemonic: 'test test test test test test test test test test test logic',
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
      },
      forking: {
        url: process.env.HTTP_RPC_URL ?? 'https://rpc.ankr.com/eth',
      },
    },
  },
};

export default config;

import type { CommandModule } from 'yargs';
import * as common from '@protocolink/common';
import fs from 'fs-extra';
import orderBy from 'lodash/orderBy';
import path from 'path';
import * as prompts from '../prompts';
import { utils } from 'ethers';

const commandModule: CommandModule<any, { file: string }> = {
  command: 'tokens',
  describe: 'Get tokens metadata',
  builder: {
    file: {
      alias: 'f',
      description: 'The json file of token addresses',
      demandOption: true,
    },
  },
  handler: async ({ file }) => {
    const filePath = path.join(process.cwd(), file);
    const tokenAddresses: string[] = fs.readJSONSync(filePath);

    const chainId = await prompts.chainIdPrompt();

    const web3Toolkit = new common.Web3Toolkit(chainId);
    const tokens = await web3Toolkit.getTokens(tokenAddresses.map(utils.getAddress));
    const tokenMap = orderBy(tokens, 'symbol').reduce((accumulator, token) => {
      accumulator[token.symbol] = token;
      return accumulator;
    }, {} as Record<string, common.Token>);
    const tokenDataPath = path.join(process.cwd(), `${file.split('.')[0]}-metadata.json`);
    fs.outputJSONSync(tokenDataPath, tokenMap, { spaces: 2 });
  },
};

export const { command, describe, builder, handler } = commandModule;

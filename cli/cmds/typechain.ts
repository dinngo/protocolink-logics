import type { CommandModule } from 'yargs';
import fs from 'fs-extra';
import { glob, runTypeChain } from 'typechain';
import path from 'path';
import prettyQuick from 'pretty-quick';
import * as prompts from '../prompts';

const outDir = 'contracts';

const commandModule: CommandModule = {
  command: 'typechain',
  describe: "Generate core or protocol's abis TypeScript classes",
  handler: async () => {
    // 1. get paths
    const protocol = await prompts.protocolPrompt();
    const rootPath = path.join(process.cwd(), 'src', 'logics', protocol);
    const contractsPath = path.join(rootPath, outDir);

    // 2. remove old contracts dir
    fs.removeSync(contractsPath);

    // 3. run typechain
    const allFiles = glob(rootPath, ['abis/*.json']);
    if (allFiles.length === 0) {
      console.log('No files passed.');
      return;
    }
    const result = await runTypeChain({
      cwd: rootPath,
      filesToProcess: allFiles,
      allFiles,
      outDir,
      target: 'ethers-v5',
    });
    prettyQuick(contractsPath);
    console.log(`Successfully generated ${result.filesGenerated} typings!`);
  },
};

export const { command, describe, handler } = commandModule;

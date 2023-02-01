import fs from 'fs';
import { glob, runTypeChain } from 'typechain';
import inquirer from 'inquirer';
import path from 'path';
import prettyQuick from 'pretty-quick';
import yargs from 'yargs';

const commandModule: yargs.CommandModule = {
  command: 'typechain',
  describe: "generate protocol's abis TypeScript classes",
  handler: async () => {
    // 1. choose category
    const { category } = await inquirer.prompt<{ category: string }>([
      {
        name: 'category',
        type: 'list',
        message: 'Whose abi do you want to typechain?',
        choices: ['core', 'protocol'],
      },
    ]);

    // 2. get paths
    const cwd = process.cwd();
    let rootDir: string;
    if (category === 'core') {
      rootDir = path.join(cwd, 'src', 'core');
    } else {
      const { protocol } = await inquirer.prompt<{ protocol: string }>([
        {
          name: 'protocol',
          type: 'input',
          message: 'Please enter the protocol name:',
          validate: (v) => {
            if (v.length === 0) return 'protocol name is required';
            return true;
          },
        },
      ]);
      rootDir = path.join(cwd, 'src', 'protocols', protocol);
    }
    const contractsDir = path.join(rootDir, 'contracts');

    // 3. remove old contracts folder
    fs.rmSync(contractsDir, { recursive: true, force: true });

    // 4. run typechain
    const allFiles = glob(rootDir, ['abis/*.json']);
    if (allFiles.length === 0) {
      console.log('No files passed.');
      return;
    }

    const result = await runTypeChain({
      cwd: rootDir,
      filesToProcess: allFiles,
      allFiles,
      outDir: 'contracts',
      target: 'ethers-v5',
    });
    prettyQuick(contractsDir);
    console.log(`Successfully generated ${result.filesGenerated} typings!`);
  },
};

export default commandModule;

import fs from 'fs-extra';
import { glob, runTypeChain } from 'typechain';
import path from 'path';
import prettyQuick from 'pretty-quick';
import * as prompts from '../prompts';

export const command = 'typechain';

export const describe = "Generate core or protocol's abis TypeScript classes";

const outDir = 'contracts';

export async function handler() {
  // 1. choose category
  const { category } = await prompts.categoryPrompt('Whose abis do you want to typechain?');

  // 2. get paths
  const dirs = [process.cwd(), 'src', category];
  if (category === 'protocols') {
    const { protocol } = await prompts.protocolPrompt();
    dirs.push(protocol);
  }
  const rootPath = path.join(...dirs);
  const contractsPath = path.join(rootPath, outDir);

  // 3. remove old contracts dir
  fs.removeSync(contractsPath);

  // 4. run typechain
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
}

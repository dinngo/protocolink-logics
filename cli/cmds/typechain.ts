import { categoryPrompt, protocolPrompt } from '../prompts';
import fs from 'fs';
import { glob, runTypeChain } from 'typechain';
import path from 'path';
import prettyQuick from 'pretty-quick';

export const command = 'typechain';

export const describe = "Generate core or protocol's abis TypeScript classes";

export async function handler() {
  // 1. choose category
  const { category } = await categoryPrompt('Whose abis do you want to typechain?');

  // 2. get paths
  const cwd = process.cwd();
  let rootDir: string;
  if (category === 'core') {
    rootDir = path.join(cwd, 'src', 'core');
  } else {
    const { protocol } = await protocolPrompt();
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
}

import fs from 'fs';
import { glob, runTypeChain } from 'typechain';
import path from 'path';
import prettyQuick from 'pretty-quick';
import yargs from 'yargs';

export default async function (args: yargs.ArgumentsCamelCase<{ name: string }>) {
  const cwd = process.cwd();
  const rootDir = path.join(cwd, 'src', ...(args.name === 'core' ? ['core'] : ['protocols', args.name]));
  const contractsDir = path.join(rootDir, 'contracts');

  // 1. remove old contracts folder
  fs.rmSync(contractsDir, { recursive: true, force: true });

  // 2. run typechain
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

import glob from 'glob';
import inquirer from 'inquirer';
import path from 'path';
import * as prompts from '../prompts';

export const command = 'script';

export const describe = "Execute core or protocol's script";

export async function handler() {
  // 1. choose category
  const { category } = await prompts.categoryPrompt('Whose script do you want to execute?');

  // 2. get paths
  const dirs = [process.cwd(), 'src', category];
  if (category === 'protocols') {
    const { protocol } = await prompts.protocolPrompt();
    dirs.push(protocol);
  }
  const rootPath = path.join(...dirs);
  const scriptsPath = path.join(rootPath, 'scripts');

  // 3. get scripts
  const scriptFiles = glob.sync('*.ts', { cwd: scriptsPath, dot: true });
  if (scriptFiles.length === 0) {
    console.log('No script files.');
    return;
  }

  // 4. execute script
  const { scriptFile } = await inquirer.prompt<{ scriptFile: string }>([
    {
      name: 'scriptFile',
      type: 'list',
      message: 'Please choose the script:',
      choices: scriptFiles,
    },
  ]);
  (await import(path.join(scriptsPath, scriptFile))).default();
}

import glob from 'glob';
import inquirer from 'inquirer';
import path from 'path';
import * as prompts from '../prompts';

export const command = 'script';

export const describe = "Execute core or protocol's script";

export async function handler() {
  // 1. get paths
  const { protocol } = await prompts.protocolPrompt();
  const scriptsPath = path.join(process.cwd(), 'src', 'protocols', protocol, 'scripts');

  // 2. get scripts
  const scriptFiles = glob.sync('*.ts', { cwd: scriptsPath, dot: true });
  if (scriptFiles.length === 0) {
    console.log('No script files.');
    return;
  }

  // 3. execute script
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

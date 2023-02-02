import fs from 'fs';
import inquirer from 'inquirer';
import path from 'path';

export async function categoryPrompt(message: string) {
  return inquirer.prompt<{ category: string }>([
    {
      name: 'category',
      type: 'list',
      message,
      choices: ['core', 'protocol'],
    },
  ]);
}

export async function protocolPrompt() {
  const cwd = process.cwd();
  const protocols = fs
    .readdirSync(path.join(cwd, 'src', 'protocols'), { withFileTypes: true })
    .reduce((accumulator, dir) => {
      if (dir.isDirectory()) accumulator.push(dir.name);
      return accumulator;
    }, [] as string[]);

  return inquirer.prompt<{ protocol: string }>([
    {
      name: 'protocol',
      type: 'autocomplete',
      message: 'Please enter the protocol name:',
      source: (_: never, input: string) => protocols.filter((protocol) => protocol.startsWith(input)),
    },
  ]);
}

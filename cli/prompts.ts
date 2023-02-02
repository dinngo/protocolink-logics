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
  return inquirer.prompt<{ protocol: string }>([
    {
      name: 'protocol',
      type: 'input',
      message: 'Please enter the protocol name:',
      validate: function (v) {
        // 1. required
        if (v.length === 0) return 'protocol name is required';
        // 2. check exist or not
        if (!fs.existsSync(path.join('src', 'protocols', v))) return 'protocol not found';

        return true;
      },
    },
  ]);
}

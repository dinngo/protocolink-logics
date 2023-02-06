import Mocha from 'mocha';
import { glob } from 'typechain';
import path from 'path';
import * as prompts from '../prompts';

export const command = 'test';

export const describe = "Run core or protocol's tests";

export const handler = async () => {
  // 1. choose category
  const { category } = await prompts.categoryPrompt('Whose tests do you want to run?');

  // 2. get root path
  const dirs = ['src', category];
  if (category === 'protocols') {
    const { protocol } = await prompts.protocolPrompt();
    dirs.push(protocol);
  }
  const rootPath = path.join(...dirs);

  // 3. run test
  const mocha = new Mocha({ timeout: 30000 });
  mocha.files = glob(rootPath, ['**/*.ts']);
  mocha.run((failures) => {
    process.on('exit', () => {
      process.exit(failures);
    });
  });
};

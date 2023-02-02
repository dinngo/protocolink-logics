import Mocha from 'mocha';
import { categoryPrompt, protocolPrompt } from '../prompts';
import { glob } from 'typechain';
import path from 'path';

export const command = 'test';

export const describe = "Run core or protocol's tests";

export const handler = async () => {
  // 1. choose category
  const { category } = await categoryPrompt('Whose tests do you want to run?');

  // 2. get dir
  let dir: string;
  if (category === 'core') {
    dir = path.join('src', 'core');
  } else {
    const { protocol } = await protocolPrompt();
    dir = path.join('src', 'protocols', protocol);
  }

  // 3. run test
  const mocha = new Mocha({ timeout: 30000 });
  mocha.files = glob(dir, ['**/*.test.ts']);
  mocha.run((failures) => {
    process.on('exit', () => {
      process.exit(failures);
    });
  });
};

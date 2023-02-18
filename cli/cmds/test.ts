import Mocha from 'mocha';
import { glob } from 'typechain';
import path from 'path';
import * as prompts from '../prompts';

export const command = 'test';

export const describe = "Run core or protocol's tests";

export const handler = async () => {
  // 1. get root path
  const { protocol } = await prompts.protocolPrompt();
  const rootPath = path.join('src', 'protocols', protocol);

  // 2. run test
  const mocha = new Mocha({ timeout: 30000 });
  mocha.files = glob(rootPath, ['**/*.ts']);
  mocha.run((failures) => {
    process.on('exit', () => {
      process.exit(failures);
    });
  });
};

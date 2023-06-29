import type { CommandModule } from 'yargs';
import Mocha from 'mocha';
import { glob } from 'typechain';
import path from 'path';
import * as prompts from '../prompts';

const commandModule: CommandModule = {
  command: 'test',
  describe: "Run core or protocol's tests",
  handler: async () => {
    // 1. get root path
    const protocol = await prompts.protocolPrompt();
    const rootPath = path.join('src', 'logics', protocol);

    // 2. run test
    const mocha = new Mocha({ timeout: 30000 });
    mocha.files = glob(rootPath, ['**/*.ts']);
    mocha.run((failures) => {
      process.on('exit', () => {
        process.exit(failures);
      });
    });
  },
};

export const { command, describe, handler } = commandModule;

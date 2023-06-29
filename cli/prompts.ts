import * as common from '@protocolink/common';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import path from 'path';

export async function protocolPrompt() {
  const cwd = process.cwd();
  const protocols = fs
    .readdirSync(path.join(cwd, 'src', 'logics'), { withFileTypes: true })
    .reduce((accumulator, dir) => {
      if (dir.isDirectory()) accumulator.push(dir.name);
      return accumulator;
    }, [] as string[]);
  const { protocol } = await inquirer.prompt<{ protocol: string }>([
    {
      name: 'protocol',
      type: 'autocomplete',
      message: 'Please enter the protocol name:',
      source: (_: never, input: string) => protocols.filter((protocol) => protocol.startsWith(input)),
    },
  ]);

  return protocol;
}

export async function chainIdPrompt() {
  const { networkId } = await inquirer.prompt<{ networkId: string }>([
    {
      name: 'networkId',
      type: 'list',
      message: 'Please select the network:',
      choices: common.networks.map(({ id }) => id),
    },
  ]);

  return common.toChainId(networkId);
}

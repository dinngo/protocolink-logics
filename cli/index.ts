import handlerTypechain from './handler.typechain';
import yargs from 'yargs';

yargs
  .scriptName('yarn cli')
  .usage('$0 <cmd> [args]')
  .command(
    'typechain <name>',
    "generate core or protocol's abi TypeScript classes",
    (yargs) => {
      yargs.positional('name', {
        type: 'string',
        describe: 'Name of the protocol',
      });
    },
    handlerTypechain
  )
  .demandCommand()
  .help()
  .alias('help', 'h').argv;

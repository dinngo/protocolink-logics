import { typechainCommand } from './commands';
import yargs from 'yargs/yargs';

yargs(process.argv.slice(2))
  .scriptName('yarn cli')
  .usage('$0 <cmd> [args]')
  .command(typechainCommand)
  .demandCommand()
  .help()
  .alias('help', 'h').argv;

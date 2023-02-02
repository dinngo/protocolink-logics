import yargs from 'yargs/yargs';

yargs(process.argv.slice(2))
  .scriptName('yarn cli')
  .usage('$0 <cmd> [args]')
  .commandDir('cmds', { extensions: ['ts'] })
  .demandCommand()
  .help()
  .alias('help', 'h').argv;

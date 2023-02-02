// https://github.com/mochajs/mocha/blob/master/example/config/.mocharc.js

module.exports = {
  extension: 'ts',
  spec: 'src/**/*.ts',
  require: ['ts-node/register', 'tsconfig-paths/register'],
  timeout: 30000,
};

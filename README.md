# Protocol Logics

[![Lint](https://github.com/dinngo/composable-router-logics/actions/workflows/lint.yml/badge.svg)](https://github.com/dinngo/composable-router-logics/actions/workflows/lint.yml)
[![Unit Test](https://github.com/dinngo/composable-router-logics/actions/workflows/unit-test.yml/badge.svg)](https://github.com/dinngo/composable-router-logics/actions/workflows/unit-test.yml)
[![E2E Test](https://github.com/dinngo/composable-router-logics/actions/workflows/e2e-test.yml/badge.svg)](https://github.com/dinngo/composable-router-logics/actions/workflows/e2e-test.yml)

SDK that build protocol logics for Composable Router

## CLI

- Generate protocol's abi TypeScript classes

  ```sh
  # - abi files: src/{protocol}/abis/*.json
  # - contracts dir: src/{protocol}/contracts
  yarn cli typechain
  ```

- Run protocol's tests

  ```sh
  yarn cli test
  ```

- Run protocol's script

  ```sh
  yarn cli script
  ```

## Hardhat e2e testing

```sh
yarn hardhat test [test file]
```

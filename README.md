# @furucombo/composable-router-logics

[![Lint](https://github.com/dinngo/composable-router-logics/actions/workflows/lint.yml/badge.svg)](https://github.com/dinngo/composable-router-logics/actions/workflows/lint.yml)
[![Unit Test](https://github.com/dinngo/composable-router-logics/actions/workflows/unit-test.yml/badge.svg)](https://github.com/dinngo/composable-router-logics/actions/workflows/unit-test.yml)
[![E2E Test: Mainnet](https://github.com/dinngo/composable-router-logics/actions/workflows/e2e-test-mainnet.yml/badge.svg)](https://github.com/dinngo/composable-router-logics/actions/workflows/e2e-test-mainnet.yml)
[![E2E Test: zkSync](https://github.com/dinngo/composable-router-logics/actions/workflows/e2e-test-zksync.yml/badge.svg)](https://github.com/dinngo/composable-router-logics/actions/workflows/e2e-test-zksync.yml)

An SDK that build protocol logics for composable router

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

## Install

Install the package via `npm`:

```sh
npm install --save-dev @furucombo/composable-router-logics
```

or `yarn`:

```sh
yarn add --dev @furucombo/composable-router-logics
```

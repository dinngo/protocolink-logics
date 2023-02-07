# Protocol Logics

[![Lint](https://github.com/dinngodev/protocol-logics/actions/workflows/lint.yml/badge.svg)](https://github.com/dinngodev/protocol-logics/actions/workflows/lint.yml)
[![Unit Test](https://github.com/dinngodev/protocol-logics/actions/workflows/unit-test.yml/badge.svg)](https://github.com/dinngodev/protocol-logics/actions/workflows/unit-test.yml)
[![E2E Test](https://github.com/dinngodev/protocol-logics/actions/workflows/e2e-test.yml/badge.svg)](https://github.com/dinngodev/protocol-logics/actions/workflows/e2e-test.yml)

An SDK that build protocol logics for Composable Router

## CLI

- Generate core, router or protocol's abi TypeScript classes

  ```sh
  # core
  # - abi files: src/core/abis/*.json
  # - contracts dir: src/core/contracts
  # router
  # - abi files: src/router/abis/*.json
  # - contracts dir: src/router/contracts
  # protocols
  # - abi files: src/protocols/{protocol}/abis/*.json
  # - contracts dir: src/protocols/{protocol}/contracts
  yarn cli typechain
  ```

- Run core, router or protocol's tests

  ```sh
  yarn cli test
  ```

- Run core, router or protocol's script

  ```sh
  yarn cli script
  ```

## Hardhat e2e testing

```sh
yarn hardhat test [test file]
```

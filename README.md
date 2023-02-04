# Protocol Logics

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

## Hardhat e2e testing

```sh
yarn hardhat test [test file]
```

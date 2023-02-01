# Protocol Logics

An SDK that build protocol logics for Composable Router

## CLI

- Generate core or protocol's abi TypeScript classes

  ```sh
  # core
  # - abi files: src/core/abis/*.json
  # - contracts dir: src/core/contracts
  # protocol
  # - abi files: src/protocols/{protocol}/abis/*.json
  # - contracts dir: src/protocols/{protocol}/contracts
  yarn cli typechain
  ```

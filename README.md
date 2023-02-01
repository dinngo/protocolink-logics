# Protocol Logics

An SDK that build protocol logics for Composable Router

## CLI

- Generate core or protocol's abi TypeScript classes

  ```sh
  # abi files: src/core/abis/*.json
  # generated dir: src/core/contracts
  yarn cli typechain core
  ```

  ```sh
  # abi files: src/protocols/{name}/abis/*.json
  # generated dir: src/protocols/{name}/contracts
  yarn cli typechain [name]
  ```

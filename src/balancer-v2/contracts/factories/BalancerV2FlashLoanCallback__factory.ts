/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from 'ethers';
import type { Provider, TransactionRequest } from '@ethersproject/providers';
import type { PromiseOrValue } from '../common';
import type { BalancerV2FlashLoanCallback, BalancerV2FlashLoanCallbackInterface } from '../BalancerV2FlashLoanCallback';

const _abi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'router_',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'balancerV2Vault_',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
    ],
    name: 'InvalidBalance',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidCaller',
    type: 'error',
  },
  {
    inputs: [],
    name: 'balancerV2Vault',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: 'tokens',
        type: 'address[]',
      },
      {
        internalType: 'uint256[]',
        name: 'amounts',
        type: 'uint256[]',
      },
      {
        internalType: 'uint256[]',
        name: 'feeAmounts',
        type: 'uint256[]',
      },
      {
        internalType: 'bytes',
        name: 'userData',
        type: 'bytes',
      },
    ],
    name: 'receiveFlashLoan',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'router',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const _bytecode =
  '0x60c060405234801561001057600080fd5b50604051610b56380380610b5683398101604081905261002f91610062565b6001600160a01b039182166080521660a052610095565b80516001600160a01b038116811461005d57600080fd5b919050565b6000806040838503121561007557600080fd5b61007e83610046565b915061008c60208401610046565b90509250929050565b60805160a051610a8a6100cc60003960008181604b0152818160d0015261036901526000818160a301526101120152610a8a6000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c806310c0a15714610046578063f04f270714610089578063f887ea401461009e575b600080fd5b61006d7f000000000000000000000000000000000000000000000000000000000000000081565b6040516001600160a01b03909116815260200160405180910390f35b61009c6100973660046107a3565b6100c5565b005b61006d7f000000000000000000000000000000000000000000000000000000000000000081565b336001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000161461010e576040516348f5c3ed60e01b815260040160405180910390fd5b60007f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031663c45f57aa6040518163ffffffff1660e01b81526004016040805180830381865afa15801561016d573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061019191906108ac565b915088905060008167ffffffffffffffff8111156101b1576101b16108e6565b6040519080825280602002602001820160405280156101da578160200160208202803683370190505b50905060005b828110156102d75760008c8c838181106101fc576101fc6108fc565b90506020020160208101906102119190610912565b9050610249858c8c85818110610229576102296108fc565b90506020020135836001600160a01b031661049e9092919063ffffffff16565b6040516370a0823160e01b81523060048201526001600160a01b038216906370a0823190602401602060405180830381865afa15801561028d573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102b19190610936565b8383815181106102c3576102c36108fc565b6020908102919091010152506001016101e0565b5060405161032d906102f8906379889b0d60e11b908890889060200161094f565b60408051601f19818403018152606083019091526025808352909190610a3060208301396001600160a01b03861691906104f5565b5060005b828110156104905760008c8c8381811061034d5761034d6108fc565b90506020020160208101906103629190610912565b90506103d57f00000000000000000000000000000000000000000000000000000000000000008a8a8581811061039a5761039a6108fc565b905060200201358d8d868181106103b3576103b36108fc565b905060200201356103c49190610973565b6001600160a01b038416919061049e565b8282815181106103e7576103e76108fc565b60209081029190910101516040516370a0823160e01b81523060048201526001600160a01b038316906370a0823190602401602060405180830381865afa158015610436573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061045a9190610936565b146104875760405162045c2160e21b81526001600160a01b03821660048201526024015b60405180910390fd5b50600101610331565b505050505050505050505050565b604080516001600160a01b038416602482015260448082018490528251808303909101815260649091019091526020810180516001600160e01b031663a9059cbb60e01b1790526104f090849061050c565b505050565b606061050484846000856105de565b949350505050565b6000610561826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c6564815250856001600160a01b03166104f59092919063ffffffff16565b8051909150156104f0578080602001905181019061057f919061099a565b6104f05760405162461bcd60e51b815260206004820152602a60248201527f5361666545524332303a204552433230206f7065726174696f6e20646964206e6044820152691bdd081cdd58d8d9595960b21b606482015260840161047e565b60608247101561063f5760405162461bcd60e51b815260206004820152602660248201527f416464726573733a20696e73756666696369656e742062616c616e636520666f6044820152651c8818d85b1b60d21b606482015260840161047e565b600080866001600160a01b0316858760405161065b91906109e0565b60006040518083038185875af1925050503d8060008114610698576040519150601f19603f3d011682016040523d82523d6000602084013e61069d565b606091505b50915091506106ae878383876106b9565b979650505050505050565b60608315610728578251600003610721576001600160a01b0385163b6107215760405162461bcd60e51b815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e7472616374000000604482015260640161047e565b5081610504565b610504838381511561073d5781518083602001fd5b8060405162461bcd60e51b815260040161047e91906109fc565b60008083601f84011261076957600080fd5b50813567ffffffffffffffff81111561078157600080fd5b6020830191508360208260051b850101111561079c57600080fd5b9250929050565b6000806000806000806000806080898b0312156107bf57600080fd5b883567ffffffffffffffff808211156107d757600080fd5b6107e38c838d01610757565b909a50985060208b01359150808211156107fc57600080fd5b6108088c838d01610757565b909850965060408b013591508082111561082157600080fd5b61082d8c838d01610757565b909650945060608b013591508082111561084657600080fd5b818b0191508b601f83011261085a57600080fd5b81358181111561086957600080fd5b8c602082850101111561087b57600080fd5b6020830194508093505050509295985092959890939650565b6001600160a01b03811681146108a957600080fd5b50565b600080604083850312156108bf57600080fd5b82516108ca81610894565b60208401519092506108db81610894565b809150509250929050565b634e487b7160e01b600052604160045260246000fd5b634e487b7160e01b600052603260045260246000fd5b60006020828403121561092457600080fd5b813561092f81610894565b9392505050565b60006020828403121561094857600080fd5b5051919050565b6001600160e01b031984168152818360048301376000910160040190815292915050565b8082018082111561099457634e487b7160e01b600052601160045260246000fd5b92915050565b6000602082840312156109ac57600080fd5b8151801515811461092f57600080fd5b60005b838110156109d75781810151838201526020016109bf565b50506000910152565b600082516109f28184602087016109bc565b9190910192915050565b6020815260008251806020840152610a1b8160408501602087016109bc565b601f01601f1916919091016040019291505056fe4552524f525f42414c414e4345525f56325f464c4153485f4c4f414e5f43414c4c4241434ba2646970667358221220df3899283595ab9f3c912f57ab77317e716d5ecb608ec54bc7efc36368d1904364736f6c63430008120033';

type BalancerV2FlashLoanCallbackConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: BalancerV2FlashLoanCallbackConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class BalancerV2FlashLoanCallback__factory extends ContractFactory {
  constructor(...args: BalancerV2FlashLoanCallbackConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    router_: PromiseOrValue<string>,
    balancerV2Vault_: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<BalancerV2FlashLoanCallback> {
    return super.deploy(router_, balancerV2Vault_, overrides || {}) as Promise<BalancerV2FlashLoanCallback>;
  }
  override getDeployTransaction(
    router_: PromiseOrValue<string>,
    balancerV2Vault_: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(router_, balancerV2Vault_, overrides || {});
  }
  override attach(address: string): BalancerV2FlashLoanCallback {
    return super.attach(address) as BalancerV2FlashLoanCallback;
  }
  override connect(signer: Signer): BalancerV2FlashLoanCallback__factory {
    return super.connect(signer) as BalancerV2FlashLoanCallback__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): BalancerV2FlashLoanCallbackInterface {
    return new utils.Interface(_abi) as BalancerV2FlashLoanCallbackInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): BalancerV2FlashLoanCallback {
    return new Contract(address, _abi, signerOrProvider) as BalancerV2FlashLoanCallback;
  }
}

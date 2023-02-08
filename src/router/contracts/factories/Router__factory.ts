/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from 'ethers';
import type { Provider, TransactionRequest } from '@ethersproject/providers';
import type { PromiseOrValue } from '../common';
import type { Router, RouterInterface } from '../Router';

const _abi = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'tokenReturn',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amountOutMin',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'balance',
        type: 'uint256',
      },
    ],
    name: 'InsufficientBalance',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidBps',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidCallback',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidERC20Sig',
    type: 'error',
  },
  {
    inputs: [],
    name: 'LengthMismatch',
    type: 'error',
  },
  {
    inputs: [],
    name: 'UnresetCallback',
    type: 'error',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'to',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: 'data',
            type: 'bytes',
          },
          {
            components: [
              {
                internalType: 'address',
                name: 'token',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'amountBps',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'amountOrOffset',
                type: 'uint256',
              },
              {
                internalType: 'bool',
                name: 'doApprove',
                type: 'bool',
              },
            ],
            internalType: 'struct IRouter.Input[]',
            name: 'inputs',
            type: 'tuple[]',
          },
          {
            components: [
              {
                internalType: 'address',
                name: 'token',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'amountMin',
                type: 'uint256',
              },
            ],
            internalType: 'struct IRouter.Output[]',
            name: 'outputs',
            type: 'tuple[]',
          },
          {
            internalType: 'address',
            name: 'callback',
            type: 'address',
          },
        ],
        internalType: 'struct IRouter.Logic[]',
        name: 'logics',
        type: 'tuple[]',
      },
      {
        internalType: 'address[]',
        name: 'tokensReturn',
        type: 'address[]',
      },
    ],
    name: 'execute',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'user',
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
    stateMutability: 'payable',
    type: 'receive',
  },
] as const;

const _bytecode =
  '0x608060405234801561001057600080fd5b50600080546001600160a01b03199081166001908117909255815416600217905561135f806100406000396000f3fe60806040526004361061002d5760003560e01c80634f8632ba14610039578063c905b7171461007557600080fd5b3661003457005b600080fd5b34801561004557600080fd5b50600054610059906001600160a01b031681565b6040516001600160a01b03909116815260200160405180910390f35b610088610083366004610f2a565b61008a565b005b600080546001600160a01b0316600019016100b95750600080546001600160a01b0319163317905560016100f8565b6001546001600160a01b031633146100e45760405163f7a632f560e01b815260040160405180910390fd5b600180546001600160a01b03191660021790555b61010485858585610125565b801561011e57600080546001600160a01b03191660011790555b5050505050565b8260005b8181101561075e57600086868381811061014557610145610f96565b90506020028101906101579190610fac565b610165906020810190610fe3565b9050600087878481811061017b5761017b610f96565b905060200281019061018d9190610fac565b61019b906020810190611005565b8080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201829052509394508b92508a91508690508181106101e6576101e6610f96565b90506020028101906101f89190610fac565b61020690604081019061104c565b808060200260200160405190810160405280939291908181526020016000905b8282101561025257610243608083028601368190038101906110bd565b81526020019060010190610226565b50505050509050600089898681811061026d5761026d610f96565b905060200281019061027f9190610fac565b61028d90606081019061113c565b808060200260200160405190810160405280939291908181526020016000905b828210156102d9576102ca60408302860136819003810190611186565b815260200190600101906102ad565b5050505050905060008a8a878181106102f4576102f4610f96565b90506020028101906103069190610fac565b6103179060a0810190608001610fe3565b90506000610324856111eb565b90506001600160e01b0319811663095ea7b360e01b148061035557506001600160e01b031981166323b872dd60e01b145b1561037357604051637f9d7cc560e01b815260040160405180910390fd5b8351600090815b818110156104e357600087828151811061039657610396610f96565b602002602001015160000151905060008883815181106103b8576103b8610f96565b6020026020010151602001519050600060001982036103f6578984815181106103e3576103e3610f96565b602002602001015160400151905061047c565b811580610404575061271082115b156104225760405163c6cc5d7f60e01b815260040160405180910390fd5b6127108261042f85610810565b6104399190611238565b6104439190611255565b905060008a858151811061045957610459610f96565b6020026020010151604001519050600019811461047a578b81016024018290525b505b89848151811061048e5761048e610f96565b602002602001015160600151156104af576104aa838d836108ae565b6104d8565b73eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeed196001600160a01b038416016104d8578095505b50505060010161037a565b50845160008167ffffffffffffffff81111561050157610501611096565b60405190808252806020026020018201604052801561052a578160200160208202803683370190505b50905060005b828110156105835761055e88828151811061054d5761054d610f96565b602002602001015160000151610810565b82828151811061057057610570610f96565b6020908102919091010152600101610530565b506001600160a01b038616156105af57600180546001600160a01b0319166001600160a01b0388161790555b6040805180820190915260148152734552524f525f524f555445525f4558454355544560601b60208201526105f2906001600160a01b038c16908b9087906109d2565b506001546001600160a01b031660021461061f57604051634875ede560e11b815260040160405180910390fd5b60005b8381101561067c5788818151811061063c5761063c610f96565b602002602001015160600151156106745761067489828151811061066257610662610f96565b6020026020010151600001518c610aaf565b600101610622565b5060005b8281101561074757600088828151811061069c5761069c610f96565b602002602001015160000151905060008983815181106106be576106be610f96565b602002602001015160200151905060008484815181106106e0576106e0610f96565b60200260200101516106f184610810565b6106fb9190611277565b90508181101561073c5760405163db42144d60e01b81526001600160a01b038416600482015260248101839052604481018290526064015b60405180910390fd5b505050600101610680565b505060019099019850610129975050505050505050565b508160005b8181101561080757600085858381811061077f5761077f610f96565b90506020020160208101906107949190610fe3565b905060006107a182610810565b905073eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeed196001600160a01b038316016107e3576000546107de906001600160a01b031682610bef565b6107fd565b6000546107fd906001600160a01b03848116911683610d08565b5050600101610763565b50505050505050565b600073eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeed196001600160a01b0383160161083e575047919050565b6040516370a0823160e01b81523060048201526001600160a01b038316906370a0823190602401602060405180830381865afa158015610882573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108a6919061128a565b90505b919050565b60405163095ea7b360e01b81526001600160a01b0383811660048301526024820183905284169063095ea7b390604401600060405180830381600087803b1580156108f857600080fd5b505af1925050508015610909575060015b6109cd5760405163095ea7b360e01b81526001600160a01b0383811660048301526000602483015284169063095ea7b390604401600060405180830381600087803b15801561095757600080fd5b505af115801561096b573d6000803e3d6000fd5b505060405163095ea7b360e01b81526001600160a01b038581166004830152602482018590528616925063095ea7b39150604401600060405180830381600087803b1580156109b957600080fd5b505af1158015610807573d6000803e3d6000fd5b505050565b606082471015610a335760405162461bcd60e51b815260206004820152602660248201527f416464726573733a20696e73756666696369656e742062616c616e636520666f6044820152651c8818d85b1b60d21b6064820152608401610733565b600080866001600160a01b03168587604051610a4f91906112c7565b60006040518083038185875af1925050503d8060008114610a8c576040519150601f19603f3d011682016040523d82523d6000602084013e610a91565b606091505b5091509150610aa287838387610d5a565b925050505b949350505050565b604051636eb1769f60e11b81523060048201526001600160a01b0382811660248301526000919084169063dd62ed3e90604401602060405180830381865afa158015610aff573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b23919061128a565b1115610beb5760405163095ea7b360e01b81526001600160a01b0382811660048301526000602483015283169063095ea7b390604401600060405180830381600087803b158015610b7357600080fd5b505af1925050508015610b84575060015b610beb5760405163095ea7b360e01b81526001600160a01b0382811660048301526001602483015283169063095ea7b390604401600060405180830381600087803b158015610bd257600080fd5b505af1158015610be6573d6000803e3d6000fd5b505050505b5050565b80471015610c3f5760405162461bcd60e51b815260206004820152601d60248201527f416464726573733a20696e73756666696369656e742062616c616e63650000006044820152606401610733565b6000826001600160a01b03168260405160006040518083038185875af1925050503d8060008114610c8c576040519150601f19603f3d011682016040523d82523d6000602084013e610c91565b606091505b50509050806109cd5760405162461bcd60e51b815260206004820152603a60248201527f416464726573733a20756e61626c6520746f2073656e642076616c75652c207260448201527f6563697069656e74206d617920686176652072657665727465640000000000006064820152608401610733565b604080516001600160a01b038416602482015260448082018490528251808303909101815260649091019091526020810180516001600160e01b031663a9059cbb60e01b1790526109cd908490610dd3565b60608315610dc9578251600003610dc2576001600160a01b0385163b610dc25760405162461bcd60e51b815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e74726163740000006044820152606401610733565b5081610aa7565b610aa78383610ea5565b6000610e28826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c6564815250856001600160a01b0316610ecf9092919063ffffffff16565b8051909150156109cd5780806020019051810190610e4691906112d9565b6109cd5760405162461bcd60e51b815260206004820152602a60248201527f5361666545524332303a204552433230206f7065726174696f6e20646964206e6044820152691bdd081cdd58d8d9595960b21b6064820152608401610733565b815115610eb55781518083602001fd5b8060405162461bcd60e51b815260040161073391906112f6565b6060610aa784846000856109d2565b60008083601f840112610ef057600080fd5b50813567ffffffffffffffff811115610f0857600080fd5b6020830191508360208260051b8501011115610f2357600080fd5b9250929050565b60008060008060408587031215610f4057600080fd5b843567ffffffffffffffff80821115610f5857600080fd5b610f6488838901610ede565b90965094506020870135915080821115610f7d57600080fd5b50610f8a87828801610ede565b95989497509550505050565b634e487b7160e01b600052603260045260246000fd5b60008235609e19833603018112610fc257600080fd5b9190910192915050565b80356001600160a01b03811681146108a957600080fd5b600060208284031215610ff557600080fd5b610ffe82610fcc565b9392505050565b6000808335601e1984360301811261101c57600080fd5b83018035915067ffffffffffffffff82111561103757600080fd5b602001915036819003821315610f2357600080fd5b6000808335601e1984360301811261106357600080fd5b83018035915067ffffffffffffffff82111561107e57600080fd5b6020019150600781901b3603821315610f2357600080fd5b634e487b7160e01b600052604160045260246000fd5b80151581146110ba57600080fd5b50565b6000608082840312156110cf57600080fd5b6040516080810181811067ffffffffffffffff8211171561110057634e487b7160e01b600052604160045260246000fd5b60405261110c83610fcc565b815260208301356020820152604083013560408201526060830135611130816110ac565b60608201529392505050565b6000808335601e1984360301811261115357600080fd5b83018035915067ffffffffffffffff82111561116e57600080fd5b6020019150600681901b3603821315610f2357600080fd5b60006040828403121561119857600080fd5b6040516040810181811067ffffffffffffffff821117156111c957634e487b7160e01b600052604160045260246000fd5b6040526111d583610fcc565b8152602083013560208201528091505092915050565b805160208201516001600160e01b0319808216929190600483101561121a5780818460040360031b1b83161693505b505050919050565b634e487b7160e01b600052601160045260246000fd5b808202811582820484141761124f5761124f611222565b92915050565b60008261127257634e487b7160e01b600052601260045260246000fd5b500490565b8181038181111561124f5761124f611222565b60006020828403121561129c57600080fd5b5051919050565b60005b838110156112be5781810151838201526020016112a6565b50506000910152565b60008251610fc28184602087016112a3565b6000602082840312156112eb57600080fd5b8151610ffe816110ac565b60208152600082518060208401526113158160408501602087016112a3565b601f01601f1916919091016040019291505056fea26469706673582212209957fa258f21d319b62e219b8322da689956acdbaf4edfcfb714a22d34f3f90464736f6c63430008110033';

type RouterConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (xs: RouterConstructorParams): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Router__factory extends ContractFactory {
  constructor(...args: RouterConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(overrides?: Overrides & { from?: PromiseOrValue<string> }): Promise<Router> {
    return super.deploy(overrides || {}) as Promise<Router>;
  }
  override getDeployTransaction(overrides?: Overrides & { from?: PromiseOrValue<string> }): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): Router {
    return super.attach(address) as Router;
  }
  override connect(signer: Signer): Router__factory {
    return super.connect(signer) as Router__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): RouterInterface {
    return new utils.Interface(_abi) as RouterInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): Router {
    return new Contract(address, _abi, signerOrProvider) as Router;
  }
}
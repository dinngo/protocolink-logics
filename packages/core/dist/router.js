"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newRouterExecuteTransactionRequest = exports.calcAccountAgent = exports.AGENT_BYTECODE = void 0;
const ethers_1 = require("ethers");
const contracts_1 = require("./contracts");
const config_1 = require("./config");
exports.AGENT_BYTECODE = '0x60a060405234801561001057600080fd5b506040516101cd3803806101cd83398101604081905261002f916100ca565b6001600160a01b038116608081905260408051600481526024810182526020810180516001600160e01b031663204a7f0760e21b179052905160009291610075916100fa565b600060405180830381855af49150503d80600081146100b0576040519150601f19603f3d011682016040523d82523d6000602084013e6100b5565b606091505b50509050806100c357600080fd5b5050610129565b6000602082840312156100dc57600080fd5b81516001600160a01b03811681146100f357600080fd5b9392505050565b6000825160005b8181101561011b5760208186018101518583015201610101565b506000920191825250919050565b608051608c6101416000396000600e0152608c6000f3fe608060405236600a57005b60317f00000000000000000000000000000000000000000000000000000000000000006033565b005b3660008037600080366000845af43d6000803e8080156051573d6000f35b3d6000fdfea2646970667358221220b300c53f0f27d6f69f51d146989995d24959784971fa921fe8c895508f88465464736f6c63430008120033';
function calcAccountAgent(chainId, account) {
    return ethers_1.utils.getCreate2Address((0, config_1.getContractAddress)(chainId, 'Router'), account.padEnd(66, '0'), ethers_1.utils.keccak256(ethers_1.utils.concat([exports.AGENT_BYTECODE, ethers_1.utils.hexZeroPad((0, config_1.getContractAddress)(chainId, 'AgentImplementation'), 32)])));
}
exports.calcAccountAgent = calcAccountAgent;
function newRouterExecuteTransactionRequest(options) {
    const { chainId, routerLogics, tokensReturn = [], value = 0 } = options;
    const iface = contracts_1.Router__factory.createInterface();
    const data = iface.encodeFunctionData('execute', [routerLogics, tokensReturn]);
    return { to: (0, config_1.getContractAddress)(chainId, 'Router'), data, value };
}
exports.newRouterExecuteTransactionRequest = newRouterExecuteTransactionRequest;
//# sourceMappingURL=router.js.map
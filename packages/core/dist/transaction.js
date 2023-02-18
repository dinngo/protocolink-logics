"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newRouterExecuteTransactionRequest = void 0;
const contracts_1 = require("./contracts");
const config_1 = require("./config");
function newRouterExecuteTransactionRequest(options) {
    const { chainId, routerLogics, tokensReturn = [], value = 0 } = options;
    const iface = contracts_1.Router__factory.createInterface();
    const data = iface.encodeFunctionData('execute', [routerLogics, tokensReturn]);
    return { to: (0, config_1.getContractAddress)(chainId, 'Router'), data, value };
}
exports.newRouterExecuteTransactionRequest = newRouterExecuteTransactionRequest;
//# sourceMappingURL=transaction.js.map
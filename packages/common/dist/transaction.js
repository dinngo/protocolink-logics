"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newErc20ApproveTransactionRequest = void 0;
const ethers_1 = require("ethers");
const contracts_1 = require("./contracts");
function newErc20ApproveTransactionRequest(token, spender, amountWei) {
    const iface = contracts_1.ERC20__factory.createInterface();
    const data = iface.encodeFunctionData('approve', [
        spender,
        amountWei !== undefined ? amountWei : ethers_1.constants.MaxUint256,
    ]);
    return { to: token.address, data };
}
exports.newErc20ApproveTransactionRequest = newErc20ApproveTransactionRequest;
//# sourceMappingURL=transaction.js.map
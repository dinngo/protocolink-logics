"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAmountBps = exports.calcAmountBps = void 0;
const constants_1 = require("../constants");
const ethers_1 = require("ethers");
function calcAmountBps(amountWei, balanceWei) {
    return ethers_1.BigNumber.from(amountWei).mul(constants_1.BPS_BASE).div(balanceWei);
}
exports.calcAmountBps = calcAmountBps;
function validateAmountBps(amountBps) {
    amountBps = ethers_1.BigNumber.from(amountBps);
    return (amountBps.gt(0) && amountBps.lte(constants_1.BPS_BASE)) || amountBps.eq(ethers_1.constants.MaxUint256);
}
exports.validateAmountBps = validateAmountBps;
//# sourceMappingURL=bps.js.map
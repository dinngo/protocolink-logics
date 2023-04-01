"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcFee = exports.calcSlippage = exports.toBigUnit = exports.toSmallUnit = void 0;
const tslib_1 = require("tslib");
const ethers_1 = require("ethers");
const bignumber_js_1 = tslib_1.__importDefault(require("bignumber.js"));
function toSmallUnit(amount, decimals) {
    return Number(amount) === 0
        ? ethers_1.BigNumber.from(0)
        : ethers_1.utils.parseUnits((0, bignumber_js_1.default)(amount).decimalPlaces(decimals, bignumber_js_1.default.ROUND_DOWN).toFixed(), decimals);
}
exports.toSmallUnit = toSmallUnit;
function toBigUnit(amountWei, decimals, options = {}) {
    const { displayDecimals, mode } = options;
    return (0, bignumber_js_1.default)(amountWei.toString())
        .shiftedBy(-decimals)
        .decimalPlaces(displayDecimals ? displayDecimals : decimals, mode === 'round' ? bignumber_js_1.default.ROUND_HALF_UP : mode === 'ceil' ? bignumber_js_1.default.ROUND_CEIL : bignumber_js_1.default.ROUND_FLOOR)
        .toFixed();
}
exports.toBigUnit = toBigUnit;
function calcSlippage(amountWei, slippage, base = 10000) {
    amountWei = ethers_1.BigNumber.from(amountWei);
    return amountWei.isZero() ? amountWei : amountWei.mul(base - slippage).div(base);
}
exports.calcSlippage = calcSlippage;
function calcFee(amountWei, premium, base = 10000) {
    return ethers_1.BigNumber.from(amountWei).mul(premium).div(base);
}
exports.calcFee = calcFee;
//# sourceMappingURL=bignumber.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newLogic = exports.newLogicInput = void 0;
const tslib_1 = require("tslib");
const ethers_1 = require("ethers");
const common = tslib_1.__importStar(require("@composable-router/common"));
const tiny_invariant_1 = tslib_1.__importDefault(require("tiny-invariant"));
function newLogicInput(options) {
    const { input } = options;
    let amountBps;
    let amountOrOffset;
    if (options.amountBps && options.amountOffset !== undefined) {
        (0, tiny_invariant_1.default)(common.validateAmountBps(options.amountBps), 'amountBps is invalid');
        amountBps = options.amountBps;
        amountOrOffset = options.amountOffset;
    }
    else {
        amountBps = ethers_1.constants.MaxUint256;
        amountOrOffset = input.amountWei;
    }
    return { token: input.token.elasticAddress, amountBps, amountOrOffset };
}
exports.newLogicInput = newLogicInput;
function newLogic(options) {
    const { to, data, inputs = [], approveTo = ethers_1.constants.AddressZero, callback = ethers_1.constants.AddressZero } = options;
    return { to, data, inputs, approveTo, callback };
}
exports.newLogic = newLogic;
//# sourceMappingURL=logic-utils.js.map
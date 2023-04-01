"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortByAddress = exports.getWrappedNativeToken = exports.getNativeToken = exports.toTokenMap = void 0;
const tslib_1 = require("tslib");
const token_1 = require("./token");
const networks_1 = require("../networks");
const sortBy_1 = tslib_1.__importDefault(require("lodash/sortBy"));
function toTokenMap(tokenObjectMap) {
    return Object.keys(tokenObjectMap).reduce((accumulator, symbol) => {
        accumulator[symbol] = new token_1.Token(tokenObjectMap[symbol]);
        return accumulator;
    }, {});
}
exports.toTokenMap = toTokenMap;
function getNativeToken(chainId) {
    return new token_1.Token((0, networks_1.getNetwork)(chainId).nativeToken);
}
exports.getNativeToken = getNativeToken;
function getWrappedNativeToken(chainId) {
    return new token_1.Token((0, networks_1.getNetwork)(chainId).wrappedNativeToken);
}
exports.getWrappedNativeToken = getWrappedNativeToken;
function sortByAddress(tokenOrAmounts) {
    return (0, sortBy_1.default)(tokenOrAmounts, (tokenOrAmount) => {
        const address = (0, token_1.isTokenTypes)(tokenOrAmount) ? tokenOrAmount.address : tokenOrAmount.token.address;
        return address.toLowerCase();
    });
}
exports.sortByAddress = sortByAddress;
//# sourceMappingURL=utils.js.map
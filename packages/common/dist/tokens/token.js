"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTokenTypes = exports.isToken = exports.isTokenObject = exports.Token = void 0;
const constants_1 = require("./constants");
const networks_1 = require("../networks");
class Token {
    constructor(arg0, ...otherArgs) {
        if (isTokenObject(arg0)) {
            this.chainId = arg0.chainId;
            this.address = arg0.address;
            this.decimals = arg0.decimals;
            this.symbol = arg0.symbol;
            this.name = arg0.name;
        }
        else {
            this.chainId = arg0;
            this.address = otherArgs[0];
            this.decimals = otherArgs[1];
            this.symbol = otherArgs[2];
            this.name = otherArgs[3];
        }
    }
    static from(token) {
        return isToken(token) ? token : new Token(token);
    }
    static isNative(arg0, ...otherArgs) {
        let chainId;
        let address;
        if (isTokenTypes(arg0)) {
            chainId = arg0.chainId;
            address = arg0.address;
        }
        else {
            chainId = arg0;
            address = otherArgs[0];
        }
        return (0, networks_1.getNetwork)(chainId).nativeToken.address === address;
    }
    static isWrapped(arg0, ...otherArgs) {
        let chainId;
        let address;
        if (isTokenTypes(arg0)) {
            chainId = arg0.chainId;
            address = arg0.address;
        }
        else {
            chainId = arg0;
            address = otherArgs[0];
        }
        return (0, networks_1.getNetwork)(chainId).wrappedNativeToken.address === address;
    }
    static getAddress(tokenOrAddress) {
        let address;
        if (isTokenTypes(tokenOrAddress)) {
            address = tokenOrAddress.address;
        }
        else {
            address = tokenOrAddress;
        }
        return address;
    }
    get wrapped() {
        return this.isNative ? new Token((0, networks_1.getNetwork)(this.chainId).wrappedNativeToken) : this;
    }
    is(token) {
        return this.chainId === token.chainId && this.address === token.address;
    }
    get isNative() {
        return this.is((0, networks_1.getNetwork)(this.chainId).nativeToken);
    }
    get isWrapped() {
        return this.is((0, networks_1.getNetwork)(this.chainId).wrappedNativeToken);
    }
    get elasticAddress() {
        return this.isNative ? constants_1.ELASTIC_ADDRESS : this.address;
    }
    sortsBefore(token) {
        return this.wrapped.address.toLowerCase() < Token.from(token).wrapped.address.toLowerCase();
    }
    toObject() {
        return {
            chainId: this.chainId,
            address: this.address,
            decimals: this.decimals,
            symbol: this.symbol,
            name: this.name,
        };
    }
}
exports.Token = Token;
function isTokenObject(v) {
    return (!isToken(v) &&
        typeof v === 'object' &&
        typeof v.chainId === 'number' &&
        typeof v.address === 'string' &&
        typeof v.decimals === 'number' &&
        typeof v.symbol === 'string' &&
        typeof v.name === 'string');
}
exports.isTokenObject = isTokenObject;
function isToken(v) {
    return v instanceof Token;
}
exports.isToken = isToken;
function isTokenTypes(v) {
    return isToken(v) || isTokenObject(v);
}
exports.isTokenTypes = isTokenTypes;
//# sourceMappingURL=token.js.map
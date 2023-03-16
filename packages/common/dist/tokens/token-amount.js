"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTokenAmounts = exports.TokenAmounts = exports.isTokenAmountObjects = exports.isTokenAmountTypes = exports.isTokenAmount = exports.isTokenAmountPair = exports.isTokenAmountObject = exports.TokenAmount = void 0;
const tslib_1 = require("tslib");
const bignumber_js_1 = tslib_1.__importDefault(require("bignumber.js"));
const token_1 = require("./token");
const tiny_invariant_1 = tslib_1.__importDefault(require("tiny-invariant"));
const orderBy_1 = tslib_1.__importDefault(require("lodash/orderBy"));
const utils_1 = require("../utils");
class TokenAmount {
    constructor(arg0, arg1) {
        var _a, _b;
        if ((0, token_1.isTokenTypes)(arg0)) {
            this.token = token_1.Token.from(arg0);
            this.amount = TokenAmount.precise(arg1 !== null && arg1 !== void 0 ? arg1 : '0', this.token.decimals);
        }
        else if (isTokenAmount(arg0)) {
            this.token = arg0.token;
            this.amount = arg0.amount;
        }
        else if (isTokenAmountObject(arg0)) {
            this.token = token_1.Token.from(arg0.token);
            this.amount = TokenAmount.precise((_a = arg0.amount) !== null && _a !== void 0 ? _a : '0', this.token.decimals);
        }
        else {
            this.token = (0, token_1.isToken)(arg0[0]) ? arg0[0] : token_1.Token.from(arg0[0]);
            this.amount = TokenAmount.precise((_b = arg0[1]) !== null && _b !== void 0 ? _b : '0', this.token.decimals);
        }
    }
    static from(tokenAmountObject) {
        return new TokenAmount(tokenAmountObject);
    }
    static precise(amount, decimals) {
        return (0, bignumber_js_1.default)(amount).decimalPlaces(decimals, bignumber_js_1.default.ROUND_DOWN).toString();
    }
    get amountWei() {
        return (0, utils_1.toSmallUnit)(this.amount, this.token.decimals);
    }
    precise(arg0) {
        let amount;
        if (isTokenAmount(arg0)) {
            (0, tiny_invariant_1.default)(arg0.token.is(this.token), "different tokens can't be clone");
            amount = arg0.amount;
        }
        else {
            amount = TokenAmount.precise(arg0, this.token.decimals);
        }
        return amount;
    }
    set(arg0) {
        this.amount = this.precise(arg0);
        return this;
    }
    setWei(amountWei) {
        this.amount = (0, utils_1.toBigUnit)(amountWei, this.token.decimals);
        return this;
    }
    add(arg0) {
        this.amount = (0, bignumber_js_1.default)(this.amount).plus(this.precise(arg0)).toString();
        return this;
    }
    addWei(amountWei) {
        this.amount = (0, bignumber_js_1.default)(this.amount).plus((0, utils_1.toBigUnit)(amountWei, this.token.decimals)).toString();
        return this;
    }
    sub(arg0) {
        this.amount = (0, bignumber_js_1.default)(this.amount).minus(this.precise(arg0)).toString();
        return this;
    }
    subWei(amountWei) {
        this.amount = (0, bignumber_js_1.default)(this.amount).minus((0, utils_1.toBigUnit)(amountWei, this.token.decimals)).toString();
        return this;
    }
    get isZero() {
        return (0, bignumber_js_1.default)(this.amount).isZero();
    }
    eq(tokenAmount) {
        return this.amountWei.eq(tokenAmount.amountWei);
    }
    gt(tokenAmount) {
        return this.amountWei.gt(tokenAmount.amountWei);
    }
    gte(tokenAmount) {
        return this.amountWei.gte(tokenAmount.amountWei);
    }
    lt(tokenAmount) {
        return this.amountWei.lt(tokenAmount.amountWei);
    }
    lte(tokenAmount) {
        return this.amountWei.lte(tokenAmount.amountWei);
    }
    toObject() {
        return { token: this.token.toObject(), amount: this.amount };
    }
    toValues() {
        return [this.token.address, this.amountWei];
    }
    clone() {
        return new TokenAmount(this.token, this.amount);
    }
}
exports.TokenAmount = TokenAmount;
function isTokenAmountObject(v) {
    return typeof v === 'object' && (0, token_1.isTokenTypes)(v.token) && typeof v.amount === 'string' && !isTokenAmount(v);
}
exports.isTokenAmountObject = isTokenAmountObject;
function isTokenAmountPair(v) {
    return Array.isArray(v) && (0, token_1.isTokenTypes)(v[0]) && typeof v[1] === 'string';
}
exports.isTokenAmountPair = isTokenAmountPair;
function isTokenAmount(v) {
    return v instanceof TokenAmount;
}
exports.isTokenAmount = isTokenAmount;
function isTokenAmountTypes(v) {
    return isTokenAmountObject(v) || isTokenAmountPair(v) || isTokenAmount(v);
}
exports.isTokenAmountTypes = isTokenAmountTypes;
function isTokenAmountObjects(v) {
    return Array.isArray(v) && isTokenAmountObject(v[0]);
}
exports.isTokenAmountObjects = isTokenAmountObjects;
class TokenAmounts {
    constructor(arg0, ...otherArgs) {
        this.tokenAmountMap = {};
        if (arg0) {
            if (isTokenAmountTypes(arg0)) {
                this.add(arg0);
            }
            else {
                for (const tokenAmount of arg0) {
                    this.add(tokenAmount);
                }
            }
        }
        for (const tokenAmount of otherArgs) {
            this.add(tokenAmount);
        }
    }
    static from(tokenAmountObjects) {
        return new TokenAmounts(tokenAmountObjects);
    }
    get length() {
        return Object.keys(this.tokenAmountMap).length;
    }
    at(index) {
        return this.toArray()[index];
    }
    get(tokenOrAddress) {
        return this.tokenAmountMap[token_1.Token.getAddress(tokenOrAddress)];
    }
    set(arg0, arg1) {
        const tokenAmount = new TokenAmount(arg0, arg1);
        this.tokenAmountMap[tokenAmount.token.address] = tokenAmount;
        return this;
    }
    has(tokenOrAddress) {
        return !!this.get(tokenOrAddress);
    }
    add(arg0, arg1) {
        const tokenAmount = new TokenAmount(arg0, arg1);
        if (this.has(tokenAmount.token)) {
            this.tokenAmountMap[tokenAmount.token.address].add(tokenAmount);
        }
        else {
            this.set(tokenAmount);
        }
        return this;
    }
    sub(arg0, arg1) {
        const tokenAmount = new TokenAmount(arg0, arg1);
        if (this.has(tokenAmount.token)) {
            this.tokenAmountMap[tokenAmount.token.address].sub(tokenAmount);
        }
        return this;
    }
    toArray() {
        return Object.keys(this.tokenAmountMap).map((tokenAddress) => this.tokenAmountMap[tokenAddress]);
    }
    toObject() {
        return (0, orderBy_1.default)(Object.keys(this.tokenAmountMap).map((tokenAddress) => this.tokenAmountMap[tokenAddress].toObject()), 'token.symbol');
    }
    toJSON() {
        return this.toObject();
    }
    toValues() {
        return Object.keys(this.tokenAmountMap).reduce((accumulator, tokenAddress) => {
            accumulator[0].push(tokenAddress);
            accumulator[1].push(this.tokenAmountMap[tokenAddress].amountWei);
            return accumulator;
        }, [[], []]);
    }
    compact() {
        const tokenAmounts = new TokenAmounts();
        Object.keys(this.tokenAmountMap).forEach((tokenAddress) => {
            if (!this.tokenAmountMap[tokenAddress].isZero) {
                tokenAmounts.add(this.tokenAmountMap[tokenAddress]);
            }
        });
        return tokenAmounts;
    }
    get isEmpty() {
        return this.length === 0;
    }
    get native() {
        let nativeTokenAmount;
        for (const tokenAddress of Object.keys(this.tokenAmountMap)) {
            const tokenAmount = this.tokenAmountMap[tokenAddress];
            if (tokenAmount.token.isNative) {
                nativeTokenAmount = tokenAmount;
                break;
            }
        }
        return nativeTokenAmount;
    }
    get erc20() {
        return Object.keys(this.tokenAmountMap).reduce((accumulator, tokenAddress) => {
            const tokenAmount = this.tokenAmountMap[tokenAddress];
            if (!tokenAmount.token.isNative)
                accumulator.set(tokenAmount);
            return accumulator;
        }, new TokenAmounts());
    }
    get tokens() {
        return Object.keys(this.tokenAmountMap).reduce((accumulator, tokenAddress) => {
            accumulator.push(this.tokenAmountMap[tokenAddress].token);
            return accumulator;
        }, []);
    }
    forEach(callbackfn) {
        Object.keys(this.tokenAmountMap).map((tokenAddress, index) => callbackfn(this.tokenAmountMap[tokenAddress], index, this));
    }
    map(callbackfn) {
        return Object.keys(this.tokenAmountMap).map((tokenAddress, index) => callbackfn(this.tokenAmountMap[tokenAddress], index, this));
    }
    merge(sources) {
        let tokenAmountsArray = [this];
        if (Array.isArray(sources)) {
            tokenAmountsArray = tokenAmountsArray.concat(sources);
        }
        else {
            tokenAmountsArray.push(sources);
        }
        const newTokenAmounts = new TokenAmounts();
        for (const tokenAmounts of tokenAmountsArray) {
            Object.keys(tokenAmounts.tokenAmountMap).forEach((tokenAddress) => {
                newTokenAmounts.add(tokenAmounts.tokenAmountMap[tokenAddress]);
            });
        }
        return newTokenAmounts;
    }
}
exports.TokenAmounts = TokenAmounts;
function isTokenAmounts(v) {
    return v instanceof TokenAmounts;
}
exports.isTokenAmounts = isTokenAmounts;
//# sourceMappingURL=token-amount.js.map
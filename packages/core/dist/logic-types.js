"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTokenToTokenExactOutParams = exports.isTokenToTokenExactInParams = exports.TradeType = exports.WrapMode = void 0;
var WrapMode;
(function (WrapMode) {
    WrapMode[WrapMode["none"] = 0] = "none";
    WrapMode[WrapMode["wrapBefore"] = 1] = "wrapBefore";
    WrapMode[WrapMode["unwrapAfter"] = 2] = "unwrapAfter";
})(WrapMode = exports.WrapMode || (exports.WrapMode = {}));
var TradeType;
(function (TradeType) {
    TradeType["exactIn"] = "exactIn";
    TradeType["exactOut"] = "exactOut";
})(TradeType = exports.TradeType || (exports.TradeType = {}));
function isTokenToTokenExactInParams(v) {
    return !!v.input && !!v.tokenOut;
}
exports.isTokenToTokenExactInParams = isTokenToTokenExactInParams;
function isTokenToTokenExactOutParams(v) {
    return !!v.tokenIn && !!v.output;
}
exports.isTokenToTokenExactOutParams = isTokenToTokenExactOutParams;
//# sourceMappingURL=logic-types.js.map
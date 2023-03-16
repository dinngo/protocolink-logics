"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTokenToTokenExactOutParams = exports.isTokenToTokenExactInParams = exports.TradeType = void 0;
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
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainnetTokens = void 0;
const tslib_1 = require("tslib");
const mainnet_json_1 = tslib_1.__importDefault(require("./mainnet.json"));
const common_1 = require("@composable-router/common");
exports.mainnetTokens = (0, common_1.toTokenMap)(mainnet_json_1.default);
//# sourceMappingURL=index.js.map
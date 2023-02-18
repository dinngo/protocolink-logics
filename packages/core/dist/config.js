"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setContractAddress = exports.getContractAddress = exports.contractAddressMap = void 0;
const tslib_1 = require("tslib");
const common = tslib_1.__importStar(require("@composable-router/common"));
exports.contractAddressMap = {
    [common.ChainId.mainnet]: {
        Router: '0x6181667418c8FA0d4ae3Aa90532D55D3994121F3',
    },
};
function getContractAddress(chainId, name) {
    return exports.contractAddressMap[chainId][name];
}
exports.getContractAddress = getContractAddress;
function setContractAddress(chainId, name, address) {
    exports.contractAddressMap[chainId][name] = address;
}
exports.setContractAddress = setContractAddress;
//# sourceMappingURL=config.js.map
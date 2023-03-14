"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setContractAddress = exports.getContractAddress = exports.contractAddressMap = void 0;
const tslib_1 = require("tslib");
const common = tslib_1.__importStar(require("@composable-router/common"));
exports.contractAddressMap = {
    [common.ChainId.mainnet]: {
        Router: '0x30E0179f60FC9D3a30Ec195322ecEaeD37D2c4CD',
        AgentImplementation: '0xCaeF6C1302bf6A6C19cc73A8500Eba2FC8FB664C',
    },
    [common.ChainId.polygon]: {
        Router: '0x30E0179f60FC9D3a30Ec195322ecEaeD37D2c4CD',
        AgentImplementation: '0xCaeF6C1302bf6A6C19cc73A8500Eba2FC8FB664C',
    },
    [common.ChainId.arbitrum]: {
        Router: '0x30E0179f60FC9D3a30Ec195322ecEaeD37D2c4CD',
        AgentImplementation: '0xCaeF6C1302bf6A6C19cc73A8500Eba2FC8FB664C',
    },
    [common.ChainId.optimism]: {
        Router: '0x30E0179f60FC9D3a30Ec195322ecEaeD37D2c4CD',
        AgentImplementation: '0xCaeF6C1302bf6A6C19cc73A8500Eba2FC8FB664C',
    },
    [common.ChainId.avalanche]: {
        Router: '0x30E0179f60FC9D3a30Ec195322ecEaeD37D2c4CD',
        AgentImplementation: '0xCaeF6C1302bf6A6C19cc73A8500Eba2FC8FB664C',
    },
    [common.ChainId.fantom]: {
        Router: '0x30E0179f60FC9D3a30Ec195322ecEaeD37D2c4CD',
        AgentImplementation: '0xCaeF6C1302bf6A6C19cc73A8500Eba2FC8FB664C',
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
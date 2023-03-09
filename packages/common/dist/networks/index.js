"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSupportedNetworkId = exports.isSupportedChainId = exports.NetworkId = exports.ChainId = exports.getNetworkId = exports.getNetwork = exports.networkMap = exports.networks = void 0;
const tslib_1 = require("tslib");
const data_json_1 = tslib_1.__importDefault(require("./data.json"));
exports.networks = data_json_1.default;
exports.networkMap = exports.networks.reduce((accumulator, network) => {
    accumulator[network.chainId] = network;
    return accumulator;
}, {});
function getNetwork(chainId) {
    return exports.networkMap[chainId];
}
exports.getNetwork = getNetwork;
function getNetworkId(chainId) {
    return getNetwork(chainId).id;
}
exports.getNetworkId = getNetworkId;
var ChainId;
(function (ChainId) {
    ChainId[ChainId["mainnet"] = 1] = "mainnet";
    ChainId[ChainId["polygon"] = 137] = "polygon";
    ChainId[ChainId["arbitrum"] = 42161] = "arbitrum";
    ChainId[ChainId["optimism"] = 10] = "optimism";
    ChainId[ChainId["avalanche"] = 43114] = "avalanche";
    ChainId[ChainId["fantom"] = 250] = "fantom";
})(ChainId = exports.ChainId || (exports.ChainId = {}));
var NetworkId;
(function (NetworkId) {
    NetworkId["mainnet"] = "mainnet";
    NetworkId["polygon"] = "polygon";
    NetworkId["arbitrum"] = "arbitrum";
    NetworkId["optimism"] = "optimism";
    NetworkId["avalanche"] = "avalanche";
    NetworkId["fantom"] = "fantom";
})(NetworkId = exports.NetworkId || (exports.NetworkId = {}));
function isSupportedChainId(chainId) {
    return exports.networks.some((network) => network.chainId == chainId);
}
exports.isSupportedChainId = isSupportedChainId;
function isSupportedNetworkId(networkId) {
    return exports.networks.some((network) => network.id == networkId);
}
exports.isSupportedNetworkId = isSupportedNetworkId;
//# sourceMappingURL=index.js.map
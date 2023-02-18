"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.revert = exports.snapshot = exports.getChainId = void 0;
async function getChainId() {
    const hre = await Promise.resolve().then(() => __importStar(require('hardhat')));
    const network = await hre.ethers.getDefaultProvider().getNetwork();
    return network.chainId;
}
exports.getChainId = getChainId;
let snapshotId;
async function snapshot() {
    const hre = await Promise.resolve().then(() => __importStar(require('hardhat')));
    snapshotId = await hre.network.provider.send('evm_snapshot', []);
}
exports.snapshot = snapshot;
async function revert() {
    const hre = await Promise.resolve().then(() => __importStar(require('hardhat')));
    await hre.network.provider.send('evm_revert', [snapshotId]);
}
exports.revert = revert;
//# sourceMappingURL=network.js.map
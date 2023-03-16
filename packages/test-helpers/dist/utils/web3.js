"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.approves = exports.approve = exports.getBalance = void 0;
const tslib_1 = require("tslib");
const common = tslib_1.__importStar(require("@composable-router/common"));
const ethers_1 = require("ethers");
const chai_1 = require("chai");
const network_1 = require("./network");
async function getBalance(account, tokenOrAddress, blockTag) {
    const hre = await Promise.resolve().then(() => tslib_1.__importStar(require('hardhat')));
    const chainId = await (0, network_1.getChainId)();
    const token = await common.tokenOrAddressToToken(chainId, tokenOrAddress, hre.ethers.provider);
    const balanceWei = token.isNative
        ? await hre.ethers.provider.getBalance(account, blockTag)
        : await common.ERC20__factory.connect(token.address, hre.ethers.provider).balanceOf(account, { blockTag });
    const balance = new common.TokenAmount(token).setWei(balanceWei);
    return balance;
}
exports.getBalance = getBalance;
async function approve(user, spender, tokenAmount) {
    if (tokenAmount.token.isNative)
        return;
    const erc20 = common.ERC20__factory.connect(tokenAmount.token.address, user);
    const allowance = await erc20.allowance(user.address, spender);
    if (allowance.gte(tokenAmount.amountWei))
        return;
    await (0, chai_1.expect)(erc20.approve(spender, ethers_1.constants.MaxUint256)).not.to.be.reverted;
}
exports.approve = approve;
async function approves(user, spender, tokenAmounts) {
    return Promise.all(tokenAmounts.map((tokenAmount) => approve(user, spender, tokenAmount)));
}
exports.approves = approves;
//# sourceMappingURL=web3.js.map
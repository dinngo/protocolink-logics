"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportChangeBalance = void 0;
const tslib_1 = require("tslib");
const common = tslib_1.__importStar(require("@composable-router/common"));
const utils_1 = require("../utils");
function supportChangeBalance(Assertion, utils) {
    Assertion.addMethod('changeBalance', function (tokenOrAddress, expectedBalanceChange, slippage) {
        const promise = getBalances(utils.flag(this, 'object'), tokenOrAddress).then(({ before, after }) => {
            const balanceChange = after.amountWei.sub(before.amountWei);
            let expectedBalanceChangeWei = common.toSmallUnit(expectedBalanceChange, before.token.decimals);
            if (slippage !== undefined) {
                expectedBalanceChangeWei = common.calcSlippage(expectedBalanceChangeWei, slippage);
                if (balanceChange.isNegative()) {
                    new Assertion(balanceChange).to.lte(expectedBalanceChangeWei);
                }
                else {
                    new Assertion(balanceChange).to.gte(expectedBalanceChangeWei);
                }
            }
            else {
                new Assertion(balanceChange).to.eq(expectedBalanceChangeWei);
            }
        });
        this.then = promise.then.bind(promise);
        this.catch = promise.then.bind(promise);
        return this;
    });
}
exports.supportChangeBalance = supportChangeBalance;
async function getBalances(account, tokenOrAddress) {
    const hre = await Promise.resolve().then(() => tslib_1.__importStar(require('hardhat')));
    const blockNumber = await hre.ethers.provider.getBlockNumber();
    const before = await (0, utils_1.getBalance)(account, tokenOrAddress, blockNumber - 1);
    const after = await (0, utils_1.getBalance)(account, tokenOrAddress, blockNumber);
    return { before, after };
}
//# sourceMappingURL=change-balance.js.map
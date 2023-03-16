"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.claimToken = exports.faucetMap = void 0;
const tslib_1 = require("tslib");
const common = tslib_1.__importStar(require("@composable-router/common"));
const helpers = tslib_1.__importStar(require("@nomicfoundation/hardhat-network-helpers"));
exports.faucetMap = {
    1: '0x0D0707963952f2fBA59dD06f2b425ace40b492Fe',
};
async function claimToken(chainId, recepient, tokenOrAddress, amount) {
    const hre = await Promise.resolve().then(() => tslib_1.__importStar(require('hardhat')));
    const faucet = exports.faucetMap[chainId];
    await helpers.impersonateAccount(faucet);
    const signer = await hre.ethers.provider.getSigner(faucet);
    const token = await common.tokenOrAddressToToken(chainId, tokenOrAddress, hre.ethers.provider);
    const tokenAmount = new common.TokenAmount(token, amount);
    if (token.isNative) {
        await signer.sendTransaction({ to: recepient, value: tokenAmount.amountWei });
    }
    else {
        if (token.isWrapped) {
            const weth = common.WETH__factory.connect(token.address, signer);
            await (await weth.deposit({ value: tokenAmount.amountWei })).wait();
        }
        const erc20 = common.ERC20__factory.connect(token.address, signer);
        await (await erc20.transfer(recepient, tokenAmount.amountWei)).wait();
    }
}
exports.claimToken = claimToken;
//# sourceMappingURL=faucet.js.map
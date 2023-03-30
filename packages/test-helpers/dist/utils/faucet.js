"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.claimToken = exports.faucetMap = void 0;
const tslib_1 = require("tslib");
const common = tslib_1.__importStar(require("@composable-router/common"));
const helpers = tslib_1.__importStar(require("@nomicfoundation/hardhat-network-helpers"));
exports.faucetMap = {
    1: {
        default: '0x0D0707963952f2fBA59dD06f2b425ace40b492Fe',
        specified: {
            '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': '0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503',
            '0xBe9895146f7AF43049ca1c1AE358B0541Ea49704': '0x629184d792f1c937DBfDd7e1055233E22c1Ca2DF',
            '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0': '0x5fEC2f34D80ED82370F733043B6A536d7e9D7f8d', // wstETH
        },
    },
};
async function claimToken(chainId, recepient, tokenOrAddress, amount) {
    var _a, _b, _c;
    const hre = await Promise.resolve().then(() => tslib_1.__importStar(require('hardhat')));
    const web3Toolkit = new common.Web3Toolkit(chainId, hre.ethers.provider);
    const token = await web3Toolkit.getToken(tokenOrAddress);
    const tokenAmount = new common.TokenAmount(token, amount);
    const faucet = (_c = (_b = (_a = exports.faucetMap[chainId]) === null || _a === void 0 ? void 0 : _a.specified) === null || _b === void 0 ? void 0 : _b[token.address]) !== null && _c !== void 0 ? _c : exports.faucetMap[chainId].default;
    await helpers.impersonateAccount(faucet);
    const signer = await hre.ethers.provider.getSigner(faucet);
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
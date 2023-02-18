"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Web3Toolkit = void 0;
const ethers_1 = require("ethers");
const tokens_1 = require("./tokens");
const contracts_1 = require("./contracts");
const networks_1 = require("./networks");
class Web3Toolkit {
    constructor(chainId, provider) {
        this.chainId = chainId;
        this.network = (0, networks_1.getNetwork)(chainId);
        this.provider = provider ? provider : new ethers_1.providers.JsonRpcProvider(this.network.rpcUrl);
        this.nativeToken = new tokens_1.Token(this.network.nativeToken);
        this.wrappedNativeToken = new tokens_1.Token(this.network.wrappedNativeToken);
    }
    get multicall2() {
        return contracts_1.Multicall2__factory.connect(this.network.multicall2Address, this.provider);
    }
    async getToken(tokenAddress) {
        if (tokenAddress === this.nativeToken.address || tokenAddress === tokens_1.ELASTIC_ADDRESS) {
            return this.nativeToken;
        }
        const iface = contracts_1.ERC20__factory.createInterface();
        const calls = [
            { target: tokenAddress, callData: iface.encodeFunctionData('decimals') },
            { target: tokenAddress, callData: iface.encodeFunctionData('symbol') },
            { target: tokenAddress, callData: iface.encodeFunctionData('name') },
        ];
        const { returnData } = await this.multicall2.callStatic.aggregate(calls);
        const [decimals] = iface.decodeFunctionResult('decimals', returnData[0]);
        let symbol;
        let name;
        try {
            [symbol] = iface.decodeFunctionResult('symbol', returnData[1]);
            [name] = iface.decodeFunctionResult('name', returnData[2]);
        }
        catch (_a) {
            symbol = ethers_1.utils.parseBytes32String(returnData[1]);
            name = ethers_1.utils.parseBytes32String(returnData[2]);
        }
        return new tokens_1.Token(this.chainId, tokenAddress, decimals, symbol, name);
    }
    async getTokens(tokenAddresses) {
        const iface = contracts_1.ERC20__factory.createInterface();
        const calls = [];
        for (const tokenAddress of tokenAddresses) {
            if (tokenAddress !== this.nativeToken.address && tokenAddress !== tokens_1.ELASTIC_ADDRESS) {
                calls.push({ target: tokenAddress, callData: iface.encodeFunctionData('decimals') });
                calls.push({ target: tokenAddress, callData: iface.encodeFunctionData('symbol') });
                calls.push({ target: tokenAddress, callData: iface.encodeFunctionData('name') });
            }
        }
        const { returnData } = await this.multicall2.callStatic.aggregate(calls);
        const tokens = [];
        let j = 0;
        for (const tokenAddress of tokenAddresses) {
            if (tokenAddress === this.nativeToken.address || tokenAddress === tokens_1.ELASTIC_ADDRESS) {
                tokens.push(this.nativeToken);
            }
            else {
                const [decimals] = iface.decodeFunctionResult('decimals', returnData[j]);
                j++;
                let symbol;
                let name;
                try {
                    [symbol] = iface.decodeFunctionResult('symbol', returnData[j]);
                    j++;
                    [name] = iface.decodeFunctionResult('name', returnData[j]);
                    j++;
                }
                catch (_a) {
                    symbol = ethers_1.utils.parseBytes32String(returnData[j]);
                    j++;
                    name = ethers_1.utils.parseBytes32String(returnData[j]);
                    j++;
                }
                tokens.push(new tokens_1.Token(this.chainId, tokenAddress, decimals, symbol, name));
            }
        }
        return tokens;
    }
    async getAllowance(account, tokenOrAddress, spender) {
        const erc20 = contracts_1.ERC20__factory.connect(tokens_1.Token.getAddress(tokenOrAddress), this.provider);
        const allowance = await erc20.allowance(account, spender);
        return allowance;
    }
    async getAllowances(account, tokenOrAddresses, spender) {
        const iface = contracts_1.ERC20__factory.createInterface();
        const calls = tokenOrAddresses.map((tokenOrAddress) => ({
            target: tokens_1.Token.getAddress(tokenOrAddress),
            callData: iface.encodeFunctionData('allowance', [account, spender]),
        }));
        const { returnData } = await this.multicall2.callStatic.aggregate(calls);
        const allowances = [];
        for (let i = 0; i < tokenOrAddresses.length; i++) {
            const [allowance] = iface.decodeFunctionResult('allowance', returnData[i]);
            allowances.push(allowance);
        }
        return allowances;
    }
}
exports.Web3Toolkit = Web3Toolkit;
//# sourceMappingURL=web3-toolkit.js.map
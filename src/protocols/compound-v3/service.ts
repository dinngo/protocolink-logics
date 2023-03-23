import { Comet__factory } from './contracts';
import * as common from '@composable-router/common';
import { getMarket } from './config';

export class Service extends common.Web3Toolkit {
  async getCToken(marketId: string) {
    const market = getMarket(this.chainId, marketId);
    const cToken = await this.getToken(market.cometAddress);

    return cToken;
  }

  async getBaseToken(marketId: string) {
    const market = getMarket(this.chainId, marketId);
    const baseToken = await this.getToken(market.baseTokenAddress);

    return baseToken;
  }

  async getCometTokens(marketId: string) {
    const market = getMarket(this.chainId, marketId);
    const tokens = await this.getTokens([market.cometAddress, market.baseTokenAddress]);

    return { cToken: tokens[0], baseToken: tokens[1] };
  }

  async getCollaterals(marketId: string) {
    const market = getMarket(this.chainId, marketId);
    const contractComet = Comet__factory.connect(market.cometAddress, this.provider);
    const numAssets = await contractComet.numAssets();

    const ifaceComet = Comet__factory.createInterface();
    const calls: common.Multicall2.CallStruct[] = [];
    for (let i = 0; i < numAssets; i++) {
      calls.push({ target: market.cometAddress, callData: ifaceComet.encodeFunctionData('getAssetInfo', [i]) });
    }
    const { returnData } = await this.multicall2.callStatic.aggregate(calls);

    const collateralAddresses = [];
    for (let i = 0; i < numAssets; i++) {
      const [{ asset }] = ifaceComet.decodeFunctionResult('getAssetInfo', returnData[i]);
      collateralAddresses.push(common.Token.isWrapped(this.chainId, asset) ? this.nativeToken.address : asset);
    }
    const collaterals = await this.getTokens(collateralAddresses);

    return collaterals;
  }

  async isAllowed(marketId: string, owner: string, manager: string) {
    const market = getMarket(this.chainId, marketId);
    const contractComet = Comet__factory.connect(market.cometAddress, this.provider);
    const isAllowed = await contractComet.isAllowed(owner, manager);

    return isAllowed;
  }

  async buildAllowTransactionRequest(
    marketId: string,
    manager: string,
    isAllowed: boolean
  ): Promise<common.TransactionRequest> {
    const market = getMarket(this.chainId, marketId);
    const to = market.cometAddress;
    const iface = Comet__factory.createInterface();
    const data = iface.encodeFunctionData('allow', [manager, isAllowed]);

    return { to, data };
  }

  async getCollateralBalance(account: string, marketId: string, asset: common.Token) {
    const market = getMarket(this.chainId, marketId);
    const contractComet = Comet__factory.connect(market.cometAddress, this.provider);
    const collateralBalance = await contractComet.collateralBalanceOf(account, asset.wrapped.address);

    return new common.TokenAmount(asset).setWei(collateralBalance);
  }

  async getBorrowBalance(account: string, marketId: string) {
    const market = getMarket(this.chainId, marketId);
    const baseToken = await this.getBaseToken(market.id);
    const contractComet = Comet__factory.connect(market.cometAddress, this.provider);
    const collateralBalance = await contractComet.borrowBalanceOf(account);

    return new common.TokenAmount(baseToken).setWei(collateralBalance);
  }

  async getUserPrincipal(account: string, marketId: string) {
    const market = getMarket(this.chainId, marketId);
    const baseToken = await this.getBaseToken(market.id);
    const contractComet = Comet__factory.connect(market.cometAddress, this.provider);
    const userBasic = await contractComet.userBasic(account);

    return new common.TokenAmount(baseToken).setWei(userBasic.principal);
  }
}

import { COMP } from './tokens';
import { CometRewards__factory, Comet__factory } from './contracts';
import * as common from '@protocolink/common';
import { getContractAddress, getMarket } from './config';

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
    const numAssets = await Comet__factory.connect(market.cometAddress, this.provider).numAssets();

    const iface = Comet__factory.createInterface();
    const calls: common.Multicall2.CallStruct[] = [];
    for (let i = 0; i < numAssets; i++) {
      calls.push({ target: market.cometAddress, callData: iface.encodeFunctionData('getAssetInfo', [i]) });
    }
    const { returnData } = await this.multicall2.callStatic.aggregate(calls);

    const collateralAddresses: string[] = [];
    for (let i = 0; i < numAssets; i++) {
      const [{ asset }] = iface.decodeFunctionResult('getAssetInfo', returnData[i]);
      if (asset === this.wrappedNativeToken.address) {
        collateralAddresses.push(this.nativeToken.address);
      }
      collateralAddresses.push(asset);
    }
    const collaterals = await this.getTokens(collateralAddresses);

    return collaterals;
  }

  async isAllowed(marketId: string, owner: string, manager: string) {
    const market = getMarket(this.chainId, marketId);
    const isAllowed = await Comet__factory.connect(market.cometAddress, this.provider).isAllowed(owner, manager);

    return isAllowed;
  }

  buildAllowTransactionRequest(marketId: string, manager: string, isAllowed: boolean): common.TransactionRequest {
    const market = getMarket(this.chainId, marketId);
    const to = market.cometAddress;
    const iface = Comet__factory.createInterface();
    const data = iface.encodeFunctionData('allow', [manager, isAllowed]);

    return { to, data };
  }

  async getCollateralBalance(marketId: string, account: string, asset: common.Token) {
    const market = getMarket(this.chainId, marketId);
    const collateralBalance = await Comet__factory.connect(market.cometAddress, this.provider).collateralBalanceOf(
      account,
      asset.wrapped.address
    );

    return new common.TokenAmount(asset).setWei(collateralBalance);
  }

  async getBorrowBalance(marketId: string, borrower: string, baseToken?: common.Token) {
    const market = getMarket(this.chainId, marketId);
    if (!baseToken) {
      baseToken = await this.getBaseToken(market.id);
    }
    const borrowBalance = await Comet__factory.connect(market.cometAddress, this.provider).borrowBalanceOf(borrower);

    return new common.TokenAmount(baseToken).setWei(borrowBalance);
  }

  async getUserPrincipal(marketId: string, account: string, baseToken?: common.Token) {
    const market = getMarket(this.chainId, marketId);
    if (!baseToken) {
      baseToken = await this.getBaseToken(market.id);
    }
    const userBasic = await Comet__factory.connect(market.cometAddress, this.provider).userBasic(account);

    return new common.TokenAmount(baseToken).setWei(userBasic.principal);
  }

  async getRewardOwed(marketId: string, owner: string) {
    const market = getMarket(this.chainId, marketId);
    const { owed } = await CometRewards__factory.connect(
      getContractAddress(this.chainId, 'CometRewards'),
      this.provider
    ).callStatic.getRewardOwed(market.cometAddress, owner);

    return new common.TokenAmount(COMP(this.chainId)).setWei(owed);
  }

  async canSupply(marketId: string, supply: common.TokenAmount) {
    const market = getMarket(this.chainId, marketId);
    const asset = supply.token.wrapped.address;

    const iface = Comet__factory.createInterface();
    const calls: common.Multicall2.CallStruct[] = [
      {
        target: market.cometAddress,
        callData: iface.encodeFunctionData('getAssetInfoByAddress', [asset]),
      },
      {
        target: market.cometAddress,
        callData: iface.encodeFunctionData('totalsCollateral', [asset]),
      },
    ];
    const { returnData } = await this.multicall2.callStatic.aggregate(calls);

    const [{ supplyCap }] = iface.decodeFunctionResult('getAssetInfoByAddress', returnData[0]);
    const [totalSupplyAsset] = iface.decodeFunctionResult('totalsCollateral', returnData[1]);

    return supplyCap.gt(totalSupplyAsset.add(supply.amountWei));
  }
}

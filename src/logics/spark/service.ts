import {
  DebtTokenBase__factory,
  PoolAddressesProvider__factory,
  PoolDataProvider,
  PoolDataProvider__factory,
  Pool__factory,
} from './contracts';
import { FlashLoanAssetInfo, FlashLoanConfiguration, InterestRateMode, ReserveTokens } from './types';
import { PoolDataProviderInterface } from './contracts/PoolDataProvider';
import { PoolInterface } from './contracts/Pool';
import * as common from '@protocolink/common';
import { constants } from 'ethers';
import { getContractAddress } from './configs';
import invariant from 'tiny-invariant';

export class Service extends common.Web3Toolkit {
  private _poolDataProvider?: PoolDataProvider;

  get poolDataProvider() {
    if (!this._poolDataProvider) {
      this._poolDataProvider = PoolDataProvider__factory.connect(
        getContractAddress(this.chainId, 'PoolDataProvider'),
        this.provider
      );
    }
    return this._poolDataProvider;
  }

  private _poolDataProviderIface?: PoolDataProviderInterface;

  get poolDataProviderIface() {
    if (!this._poolDataProviderIface) {
      this._poolDataProviderIface = PoolDataProvider__factory.createInterface();
    }
    return this._poolDataProviderIface;
  }

  private _poolIface?: PoolInterface;

  get poolIface() {
    if (!this._poolIface) {
      this._poolIface = Pool__factory.createInterface();
    }
    return this._poolIface;
  }

  private poolAddress?: string;

  async getPoolAddress() {
    if (!this.poolAddress) {
      const addressProviderAddress = await this.poolDataProvider.ADDRESSES_PROVIDER();
      this.poolAddress = await PoolAddressesProvider__factory.connect(addressProviderAddress, this.provider).getPool();
    }

    return this.poolAddress;
  }

  private reserveTokens?: ReserveTokens[];
  private reserveMap?: Record<string, ReserveTokens>;

  async getReserveTokens() {
    if (!this.reserveTokens || !this.reserveMap) {
      const tokenAddresses: string[] = [];
      const reserveTokens: ReserveTokens[] = [];
      const reserveMap: Record<string, any> = {};

      const poolAddress = await this.getPoolAddress();
      const assetAddresses = await Pool__factory.connect(poolAddress, this.provider).getReservesList();

      const calls: common.Multicall3.CallStruct[] = assetAddresses.flatMap((assetAddress) => [
        {
          target: this.poolDataProvider.address,
          callData: this.poolDataProviderIface.encodeFunctionData('getReserveConfigurationData', [assetAddress]),
        },
        {
          target: this.poolDataProvider.address,
          callData: this.poolDataProviderIface.encodeFunctionData('getReserveTokensAddresses', [assetAddress]),
        },
      ]);
      const { returnData } = await this.multicall3.callStatic.aggregate(calls);

      assetAddresses.forEach((assetAddress, i) => {
        const { isActive, isFrozen, borrowingEnabled } = this.poolDataProviderIface.decodeFunctionResult(
          'getReserveConfigurationData',
          returnData[i * 2]
        );

        const { aTokenAddress, stableDebtTokenAddress, variableDebtTokenAddress } =
          this.poolDataProviderIface.decodeFunctionResult('getReserveTokensAddresses', returnData[i * 2 + 1]);

        reserveMap[assetAddress] = {
          isSupplyEnabled: isActive && !isFrozen,
          isBorrowEnabled: isActive && !isFrozen && borrowingEnabled,
        };

        tokenAddresses.push(assetAddress, aTokenAddress, stableDebtTokenAddress, variableDebtTokenAddress);
      });

      const tokens = await this.getTokens(tokenAddresses);

      for (let i = 0; i < tokens.length; i += 4) {
        const asset = tokens[i];
        const aToken = tokens[i + 1];
        const stableDebtToken = tokens[i + 2];
        const variableDebtToken = tokens[i + 3];

        const reserveToken: ReserveTokens = {
          ...reserveMap[asset.address],
          asset,
          aToken,
          stableDebtToken,
          variableDebtToken,
        };

        reserveTokens.push(reserveToken);

        reserveMap[asset.address] = reserveToken;

        // Add aToken address as key for quick lookup
        reserveMap[aToken.address] = reserveToken;
      }

      this.reserveTokens = reserveTokens;
      this.reserveMap = reserveMap;
    }

    return { reserveTokens: this.reserveTokens, reserveMap: this.reserveMap };
  }

  async getAssets() {
    const { reserveTokens } = await this.getReserveTokens();
    return reserveTokens.map(({ asset }) => asset);
  }

  async getATokens() {
    const { reserveTokens } = await this.getReserveTokens();
    return reserveTokens.map(({ aToken }) => aToken);
  }

  async getSupplyTokens() {
    const { reserveTokens } = await this.getReserveTokens();
    return reserveTokens.filter(({ isSupplyEnabled }) => isSupplyEnabled);
  }

  async getBorrowTokens() {
    const { reserveTokens } = await this.getReserveTokens();
    return reserveTokens.filter(({ isBorrowEnabled }) => isBorrowEnabled);
  }

  async toAToken(asset: common.Token) {
    const { reserveMap } = await this.getReserveTokens();

    const aToken = reserveMap[asset.wrapped.address]?.aToken;
    invariant(aToken?.address !== constants.AddressZero, `unsupported asset: ${asset.wrapped.address}`);

    return aToken;
  }

  async toATokens(assets: common.Token[]) {
    const { reserveMap } = await this.getReserveTokens();

    return assets.map((asset) => {
      const aToken = reserveMap[asset.wrapped.address]?.aToken;
      invariant(aToken?.address !== constants.AddressZero, `unsupported asset: ${asset.wrapped.address}`);

      return aToken;
    });
  }

  async toAsset(aToken: common.Token) {
    const { reserveMap } = await this.getReserveTokens();

    const asset = reserveMap[aToken.address]?.asset;
    invariant(asset, `unsupported aToken: ${aToken.address}`);

    return asset;
  }

  async getDebtTokenAddress(asset: common.Token, interestRateMode: InterestRateMode) {
    const { reserveMap } = await this.getReserveTokens();

    const { stableDebtToken, variableDebtToken } = reserveMap[asset.wrapped.address];
    invariant(stableDebtToken || variableDebtToken, `unsupported aToken: ${asset.wrapped.address}`);

    return interestRateMode === InterestRateMode.variable ? variableDebtToken.address : stableDebtToken.address;
  }

  async getFlashLoanPremiumTotal() {
    const poolAddress = await this.getPoolAddress();
    const premium = await Pool__factory.connect(poolAddress, this.provider).FLASHLOAN_PREMIUM_TOTAL();

    return premium.toNumber();
  }

  async isDelegationApproved(
    account: string,
    delegateeAddress: string,
    assetAmount: common.TokenAmount,
    interestRateMode: InterestRateMode
  ) {
    const debtTokenAddress = await this.getDebtTokenAddress(assetAmount.token, interestRateMode);
    const borrowAllowance = await DebtTokenBase__factory.connect(debtTokenAddress, this.provider).borrowAllowance(
      account,
      delegateeAddress
    );

    return borrowAllowance.gte(assetAmount.amountWei);
  }

  async buildApproveDelegationTransactionRequest(
    delegateeAddress: string,
    assetAmount: common.TokenAmount,
    interestRateMode: InterestRateMode
  ): Promise<common.TransactionRequest> {
    const to = await this.getDebtTokenAddress(assetAmount.token, interestRateMode);
    const iface = DebtTokenBase__factory.createInterface();
    const data = iface.encodeFunctionData('approveDelegation', [delegateeAddress, constants.MaxUint256]);

    return { to, data };
  }

  async getFlashLoanConfiguration(assets: common.Token[]): Promise<FlashLoanConfiguration> {
    const aTokens = await this.toATokens(assets);
    const poolAddress = await this.getPoolAddress();

    const calls: common.Multicall3.CallStruct[] = [
      { target: poolAddress, callData: this.poolIface.encodeFunctionData('FLASHLOAN_PREMIUM_TOTAL') },
    ];
    for (let i = 0; i < assets.length; i++) {
      const assetAddress = assets[i].wrapped.address;
      calls.push({
        target: this.poolDataProvider.address,
        callData: this.poolDataProviderIface.encodeFunctionData('getPaused', [assetAddress]),
      });
      calls.push({
        target: this.poolDataProvider.address,
        callData: this.poolDataProviderIface.encodeFunctionData('getReserveConfigurationData', [assetAddress]),
      });
      calls.push({
        target: this.poolDataProvider.address,
        callData: this.poolDataProviderIface.encodeFunctionData('getFlashLoanEnabled', [assetAddress]),
      });
      calls.push({
        target: assetAddress,
        callData: this.erc20Iface.encodeFunctionData('balanceOf', [aTokens[i].address]),
      });
    }
    const { returnData } = await this.multicall3.callStatic.aggregate(calls);

    let j = 0;
    const [premium] = this.poolIface.decodeFunctionResult('FLASHLOAN_PREMIUM_TOTAL', returnData[j]);
    const feeBps = premium.toNumber();
    j++;

    const assetInfos: FlashLoanAssetInfo[] = [];
    for (let i = 0; i < assets.length; i++) {
      const [isPaused] = this.poolDataProviderIface.decodeFunctionResult('getPaused', returnData[j]);
      j++;

      const { isActive } = this.poolDataProviderIface.decodeFunctionResult(
        'getReserveConfigurationData',
        returnData[j]
      );
      j++;

      const [isFlashLoanEnabled] = this.poolDataProviderIface.decodeFunctionResult(
        'getFlashLoanEnabled',
        returnData[j]
      );
      j++;

      const [balance] = this.erc20Iface.decodeFunctionResult('balanceOf', returnData[j]);
      const availableToBorrow = new common.TokenAmount(assets[i]).setWei(balance);
      j++;

      assetInfos.push({ isPaused, isActive, isFlashLoanEnabled, availableToBorrow });
    }

    return { feeBps: feeBps, assetInfos };
  }
}

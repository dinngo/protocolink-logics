import {
  AToken__factory,
  DebtTokenBase__factory,
  PoolAddressesProvider__factory,
  PoolDataProvider,
  PoolDataProvider__factory,
  Pool__factory,
} from './contracts';
import {
  FlashLoanAssetInfo,
  FlashLoanConfiguration,
  InterestRateMode,
  ReserveTokens,
  ReserveTokensAddress,
} from './types';
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

  private assetAddresses?: string[];

  async getAssetAddresses() {
    if (!this.assetAddresses) {
      const poolAddress = await this.getPoolAddress();
      const assetAddresses = await Pool__factory.connect(poolAddress, this.provider).getReservesList();

      const calls: common.Multicall2.CallStruct[] = assetAddresses.map((assetAddress) => ({
        target: this.poolDataProvider.address,
        callData: this.poolDataProviderIface.encodeFunctionData('getReserveConfigurationData', [assetAddress]),
      }));
      const { returnData } = await this.multicall2.callStatic.aggregate(calls);

      this.assetAddresses = [];
      for (let i = 0; i < assetAddresses.length; i++) {
        const assetAddress = assetAddresses[i];
        const { isActive, isFrozen } = this.poolDataProviderIface.decodeFunctionResult(
          'getReserveConfigurationData',
          returnData[i]
        );
        if (isActive && !isFrozen) this.assetAddresses.push(assetAddress);
      }
    }

    return this.assetAddresses;
  }

  private reserveTokensAddresses?: ReserveTokensAddress[];

  async getReserveTokensAddresses() {
    if (!this.reserveTokensAddresses) {
      const assetAddresses = await this.getAssetAddresses();

      const calls: common.Multicall2.CallStruct[] = assetAddresses.map((asset) => ({
        target: this.poolDataProvider.address,
        callData: this.poolDataProviderIface.encodeFunctionData('getReserveTokensAddresses', [asset]),
      }));
      const { returnData } = await this.multicall2.callStatic.aggregate(calls);

      this.reserveTokensAddresses = [];
      for (let i = 0; i < assetAddresses.length; i++) {
        const assetAddress = assetAddresses[i];
        const { aTokenAddress, stableDebtTokenAddress, variableDebtTokenAddress } =
          this.poolDataProviderIface.decodeFunctionResult('getReserveTokensAddresses', returnData[i]);
        this.reserveTokensAddresses.push({
          assetAddress,
          aTokenAddress,
          stableDebtTokenAddress,
          variableDebtTokenAddress,
        });
      }
    }

    return this.reserveTokensAddresses;
  }

  private assets?: common.Token[];

  async getAssets() {
    if (!this.assets) {
      const assetAddresses = await this.getAssetAddresses();
      this.assets = await this.getTokens(assetAddresses);
    }
    return this.assets;
  }

  private aTokens?: common.Token[];

  async getATokens() {
    if (!this.aTokens) {
      const reserveTokensAddresses = await this.getReserveTokensAddresses();
      const aTokenAddresses = reserveTokensAddresses.map((reserveTokensAddress) => reserveTokensAddress.aTokenAddress);
      this.aTokens = await this.getTokens(aTokenAddresses);
    }
    return this.aTokens;
  }

  private reserveTokens?: ReserveTokens[];

  async getReserveTokens() {
    if (!this.reserveTokens) {
      const reserveTokensAddresses = await this.getReserveTokensAddresses();
      const tokenAddresses = reserveTokensAddresses.reduce<string[]>((accumulator, reserveTokensAddress) => {
        accumulator.push(reserveTokensAddress.assetAddress);
        accumulator.push(reserveTokensAddress.aTokenAddress);
        accumulator.push(reserveTokensAddress.stableDebtTokenAddress);
        accumulator.push(reserveTokensAddress.variableDebtTokenAddress);
        return accumulator;
      }, []);
      const tokens = await this.getTokens(tokenAddresses);

      this.reserveTokens = [];
      let j = 0;
      for (let i = 0; i < reserveTokensAddresses.length; i++) {
        const asset = tokens[j];
        j++;
        const aToken = tokens[j];
        j++;
        const stableDebtToken = tokens[j];
        j++;
        const variableDebtToken = tokens[j];
        j++;
        this.reserveTokens.push({ asset, aToken, stableDebtToken, variableDebtToken });
      }
    }

    return this.reserveTokens;
  }

  async toAToken(asset: common.Token) {
    const { aTokenAddress } = await this.poolDataProvider.getReserveTokensAddresses(asset.wrapped.address);
    invariant(aTokenAddress !== constants.AddressZero, `unsupported asset: ${asset.wrapped.address}`);

    return this.getToken(aTokenAddress);
  }

  async toATokens(assets: common.Token[]) {
    const calls: common.Multicall2.CallStruct[] = assets.map((asset) => ({
      target: this.poolDataProvider.address,
      callData: this.poolDataProviderIface.encodeFunctionData('getReserveTokensAddresses', [asset.wrapped.address]),
    }));
    const { returnData } = await this.multicall2.callStatic.aggregate(calls);

    const aTokenAddresses: string[] = [];
    for (let i = 0; i < assets.length; i++) {
      const { aTokenAddress } = this.poolDataProviderIface.decodeFunctionResult(
        'getReserveTokensAddresses',
        returnData[i]
      );
      invariant(aTokenAddress !== constants.AddressZero, `unsupported asset: ${assets[i].wrapped.address}`);
      aTokenAddresses.push(aTokenAddress);
    }

    return this.getTokens(aTokenAddresses);
  }

  async toAsset(aToken: common.Token) {
    const assetAddress = await AToken__factory.connect(aToken.address, this.provider).UNDERLYING_ASSET_ADDRESS();
    return this.getToken(assetAddress);
  }

  async getDebtTokenAddress(asset: common.Token, interestRateMode: InterestRateMode) {
    const { stableDebtTokenAddress, variableDebtTokenAddress } = await this.poolDataProvider.getReserveTokensAddresses(
      asset.wrapped.address
    );

    return interestRateMode === InterestRateMode.variable ? variableDebtTokenAddress : stableDebtTokenAddress;
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

    const calls: common.Multicall2.CallStruct[] = [
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
    const { returnData } = await this.multicall2.callStatic.aggregate(calls);

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
      const avaliableToBorrow = new common.TokenAmount(assets[i]).setWei(balance);
      j++;

      assetInfos.push({ isPaused, isActive, isFlashLoanEnabled, avaliableToBorrow });
    }

    return { feeBps: feeBps, assetInfos };
  }
}

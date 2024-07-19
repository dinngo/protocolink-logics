import {
  DebtTokenBase__factory,
  LendingPoolAddressesProvider__factory,
  LendingPool__factory,
  ProtocolDataProvider,
  ProtocolDataProvider__factory,
} from './contracts';
import { FlashLoanAssetInfo, FlashLoanConfiguration, InterestRateMode, ReserveTokens } from './types';
import { LendingPoolInterface } from './contracts/LendingPool';
import { ProtocolDataProviderInterface } from './contracts/ProtocolDataProvider';
import * as common from '@protocolink/common';
import { constants } from 'ethers';
import { getContractAddress } from './configs';
import invariant from 'tiny-invariant';

export class Service extends common.Web3Toolkit {
  private _protocolDataProvider?: ProtocolDataProvider;

  get protocolDataProvider() {
    if (!this._protocolDataProvider) {
      this._protocolDataProvider = ProtocolDataProvider__factory.connect(
        getContractAddress(this.chainId, 'ProtocolDataProvider'),
        this.provider
      );
    }
    return this._protocolDataProvider;
  }

  private _protocolDataProviderIface?: ProtocolDataProviderInterface;

  get protocolDataProviderIface() {
    if (!this._protocolDataProviderIface) {
      this._protocolDataProviderIface = ProtocolDataProvider__factory.createInterface();
    }
    return this._protocolDataProviderIface;
  }

  private _lendingPoolIface?: LendingPoolInterface;

  get lendingPoolIface() {
    if (!this._lendingPoolIface) {
      this._lendingPoolIface = LendingPool__factory.createInterface();
    }
    return this._lendingPoolIface;
  }

  private lendingPoolAddress?: string;

  async getLendingPoolAddress() {
    if (!this.lendingPoolAddress) {
      const addressProviderAddress = await this.protocolDataProvider.ADDRESSES_PROVIDER();
      this.lendingPoolAddress = await LendingPoolAddressesProvider__factory.connect(
        addressProviderAddress,
        this.provider
      ).getLendingPool();
    }

    return this.lendingPoolAddress;
  }

  private reserveTokens?: ReserveTokens[];
  private reserveMap?: Record<string, ReserveTokens>;

  async getReserveTokens() {
    if (!this.reserveTokens) {
      const tokenAddresses: string[] = [];
      const reserveTokens: ReserveTokens[] = [];
      const reserveMap: Record<string, any> = {};

      const lendingPoolAddress = await this.getLendingPoolAddress();
      const assetAddresses = await LendingPool__factory.connect(lendingPoolAddress, this.provider).getReservesList();

      const calls: common.Multicall3.CallStruct[] = assetAddresses.flatMap((assetAddress) => [
        {
          target: this.protocolDataProvider.address,
          callData: this.protocolDataProviderIface.encodeFunctionData('getReserveConfigurationData', [assetAddress]),
        },
        {
          target: this.protocolDataProvider.address,
          callData: this.protocolDataProviderIface.encodeFunctionData('getReserveTokensAddresses', [assetAddress]),
        },
      ]);
      const { returnData } = await this.multicall3.callStatic.aggregate(calls);

      assetAddresses.forEach((assetAddress, i) => {
        const { isActive, isFrozen, borrowingEnabled } = this.protocolDataProviderIface.decodeFunctionResult(
          'getReserveConfigurationData',
          returnData[i * 2]
        );

        const { aTokenAddress, stableDebtTokenAddress, variableDebtTokenAddress } =
          this.protocolDataProviderIface.decodeFunctionResult('getReserveTokensAddresses', returnData[i * 2 + 1]);

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

    return { reserveTokens: this.reserveTokens!, reserveMap: this.reserveMap! };
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
    return Promise.all(assets.map((asset) => this.toAToken(asset)));
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
    const lendingPoolAddress = await this.getLendingPoolAddress();
    const premium = await LendingPool__factory.connect(lendingPoolAddress, this.provider).FLASHLOAN_PREMIUM_TOTAL();

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
    const poolAddress = await this.getLendingPoolAddress();

    const calls: common.Multicall3.CallStruct[] = [
      { target: poolAddress, callData: this.lendingPoolIface.encodeFunctionData('FLASHLOAN_PREMIUM_TOTAL') },
    ];
    for (let i = 0; i < assets.length; i++) {
      const assetAddress = assets[i].wrapped.address;
      calls.push({
        target: this.protocolDataProvider.address,
        callData: this.protocolDataProviderIface.encodeFunctionData('getReserveConfigurationData', [assetAddress]),
      });
      calls.push({
        target: assetAddress,
        callData: this.erc20Iface.encodeFunctionData('balanceOf', [aTokens[i].address]),
      });
    }
    const { returnData } = await this.multicall3.callStatic.aggregate(calls);

    let j = 0;
    const [premium] = this.lendingPoolIface.decodeFunctionResult('FLASHLOAN_PREMIUM_TOTAL', returnData[j]);
    const feeBps = premium.toNumber();
    j++;

    const assetInfos: FlashLoanAssetInfo[] = [];
    for (let i = 0; i < assets.length; i++) {
      const { isActive } = this.protocolDataProviderIface.decodeFunctionResult(
        'getReserveConfigurationData',
        returnData[j]
      );
      j++;

      const [balance] = this.erc20Iface.decodeFunctionResult('balanceOf', returnData[j]);
      const availableToBorrow = new common.TokenAmount(assets[i]).setWei(balance);
      j++;

      assetInfos.push({ isActive, availableToBorrow });
    }

    return { feeBps: feeBps, assetInfos };
  }
}

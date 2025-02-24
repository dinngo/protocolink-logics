import {
  DebtTokenBase__factory,
  LendingPool,
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
import { parseReserveConfiguration } from './parser';

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

  private _lendingPool?: LendingPool;

  get lendingPool() {
    if (!this._lendingPool) {
      this._lendingPool = LendingPool__factory.connect(getContractAddress(this.chainId, 'LendingPool'), this.provider);
    }
    return this._lendingPool;
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
    if (this.lendingPool.address) {
      this.lendingPoolAddress = this.lendingPool.address;
    } else {
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
    if (!this.reserveTokens || !this.reserveMap) {
      const tokenAddresses: string[] = [];
      const reserveTokens: ReserveTokens[] = [];
      const reserveMap: Record<string, any> = {};

      const assetAddresses = await this.lendingPool.getReservesList();

      const calls: common.Multicall3.CallStruct[] = assetAddresses.flatMap((assetAddress) => [
        {
          target: this.lendingPool.address,
          callData: this.lendingPoolIface.encodeFunctionData('getReserveData', [assetAddress]),
        },
      ]);

      const { returnData } = await this.multicall3.callStatic.aggregate(calls);

      assetAddresses.forEach((assetAddress, i) => {
        const [reserveData] = this.lendingPoolIface.decodeFunctionResult('getReserveData', returnData[i]);

        const { configuration, rTokenAddress, stableDebtTokenAddress, variableDebtTokenAddress } = reserveData;

        const { isActive, isFrozen, borrowingEnabled } = parseReserveConfiguration(configuration);

        reserveMap[assetAddress] = {
          isSupplyEnabled: isActive && !isFrozen,
          isBorrowEnabled: isActive && !isFrozen && borrowingEnabled,
        };

        tokenAddresses.push(assetAddress, rTokenAddress, stableDebtTokenAddress, variableDebtTokenAddress);
      });

      const tokens = await this.getTokens(tokenAddresses);

      for (let i = 0; i < tokens.length; i += 4) {
        const asset = tokens[i];
        const rToken = tokens[i + 1];
        const stableDebtToken = tokens[i + 2];
        const variableDebtToken = tokens[i + 3];

        const reserveToken: ReserveTokens = {
          ...reserveMap[asset.address],
          asset,
          rToken,
          stableDebtToken,
          variableDebtToken,
        };

        reserveTokens.push(reserveToken);

        reserveMap[asset.address] = reserveToken;

        // Add rToken address as key for quick lookup
        reserveMap[rToken.address] = reserveToken;
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
    return reserveTokens.map(({ rToken }) => rToken);
  }

  async getSupplyTokens() {
    const { reserveTokens } = await this.getReserveTokens();
    return reserveTokens.filter(({ isSupplyEnabled }) => isSupplyEnabled);
  }

  async getBorrowTokens() {
    const { reserveTokens } = await this.getReserveTokens();
    return reserveTokens.filter(({ isBorrowEnabled }) => isBorrowEnabled);
  }

  async toRToken(asset: common.Token) {
    const { reserveMap } = await this.getReserveTokens();

    const rToken = reserveMap[asset.wrapped.address]?.rToken;
    invariant(rToken?.address !== constants.AddressZero, `unsupported asset: ${asset.wrapped.address}`);

    return rToken;
  }

  async toRTokens(assets: common.Token[]) {
    const { reserveMap } = await this.getReserveTokens();

    return assets.map((asset) => {
      const rToken = reserveMap[asset.wrapped.address]?.rToken;
      invariant(rToken?.address !== constants.AddressZero, `unsupported asset: ${asset.wrapped.address}`);

      return rToken;
    });
  }

  async toAsset(rToken: common.Token) {
    const { reserveMap } = await this.getReserveTokens();

    const asset = reserveMap[rToken.address]?.asset;
    invariant(asset, `unsupported aToken: ${rToken.address}`);

    return asset;
  }

  async getDebtTokenAddress(asset: common.Token, interestRateMode: InterestRateMode) {
    const { reserveMap } = await this.getReserveTokens();

    const { stableDebtToken, variableDebtToken } = reserveMap[asset.wrapped.address];
    invariant(stableDebtToken || variableDebtToken, `unsupported aToken: ${asset.wrapped.address}`);

    return interestRateMode === InterestRateMode.variable ? variableDebtToken.address : stableDebtToken.address;
  }

  async getFlashLoanPremiumTotal() {
    const premium = await this.lendingPool.FLASHLOAN_PREMIUM_TOTAL();

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
    const rTokens = await this.toRTokens(assets);

    const calls: common.Multicall3.CallStruct[] = [
      {
        target: this.lendingPool.address,
        callData: this.lendingPoolIface.encodeFunctionData('FLASHLOAN_PREMIUM_TOTAL'),
      },
    ];
    for (let i = 0; i < assets.length; i++) {
      const assetAddress = assets[i].wrapped.address;
      calls.push({
        target: this.lendingPool.address,
        callData: this.lendingPoolIface.encodeFunctionData('getReserveData', [assetAddress]),
      });
      calls.push({
        target: assetAddress,
        callData: this.erc20Iface.encodeFunctionData('balanceOf', [rTokens[i].address]),
      });
    }
    const { returnData } = await this.multicall3.callStatic.aggregate(calls);

    let j = 0;
    const [premium] = this.lendingPoolIface.decodeFunctionResult('FLASHLOAN_PREMIUM_TOTAL', returnData[j]);
    const feeBps = premium.toNumber();
    j++;

    const assetInfos: FlashLoanAssetInfo[] = [];
    for (let i = 0; i < assets.length; i++) {
      const [{ configuration }] = this.lendingPoolIface.decodeFunctionResult('getReserveData', returnData[j]);
      const { isActive } = parseReserveConfiguration(configuration);
      j++;

      const [balance] = this.erc20Iface.decodeFunctionResult('balanceOf', returnData[j]);
      const availableToBorrow = new common.TokenAmount(assets[i]).setWei(balance);
      j++;

      assetInfos.push({ isActive, availableToBorrow });
    }

    return { feeBps: feeBps, assetInfos };
  }
}

import {
  AToken__factory,
  DebtTokenBase__factory,
  PoolAddressesProvider__factory,
  PoolDataProvider__factory,
  Pool__factory,
} from './contracts';
import { InterestRateMode, ReserveTokens, ReserveTokensAddress } from './types';
import * as common from '@composable-router/common';
import { constants } from 'ethers';
import { getContractAddress } from './config';

export class Service extends common.Web3Toolkit {
  get poolDataProvider() {
    return PoolDataProvider__factory.connect(getContractAddress(this.chainId, 'PoolDataProvider'), this.provider);
  }

  private PoolAddress?: string;

  async getPoolAddress() {
    if (!this.PoolAddress) {
      const PoolAddressProviderAddress = await this.poolDataProvider.ADDRESSES_PROVIDER();
      const PoolAddressProvider = PoolAddressesProvider__factory.connect(PoolAddressProviderAddress, this.provider);
      this.PoolAddress = await PoolAddressProvider.getPool();
    }

    return this.PoolAddress;
  }

  private assetAddresses?: string[];

  async getAssetAddresses() {
    if (!this.assetAddresses) {
      const PoolAddress = await this.getPoolAddress();
      const Pool = Pool__factory.connect(PoolAddress, this.provider);
      const assetAddresses = await Pool.getReservesList();

      const iface = PoolDataProvider__factory.createInterface();
      const calls: common.Multicall2.CallStruct[] = assetAddresses.map((assetAddress) => ({
        target: getContractAddress(this.chainId, 'PoolDataProvider'),
        callData: iface.encodeFunctionData('getReserveConfigurationData', [assetAddress]),
      }));
      const { returnData } = await this.multicall2.callStatic.aggregate(calls);

      this.assetAddresses = [];
      for (let i = 0; i < assetAddresses.length; i++) {
        const assetAddress = assetAddresses[i];
        const { isActive, isFrozen } = iface.decodeFunctionResult('getReserveConfigurationData', returnData[i]);
        if (isActive && !isFrozen) this.assetAddresses.push(assetAddress);
      }
    }

    return this.assetAddresses;
  }

  private reserveTokensAddresses?: ReserveTokensAddress[];

  async getReserveTokensAddresses() {
    if (!this.reserveTokensAddresses) {
      const assetAddresses = await this.getAssetAddresses();

      const iface = PoolDataProvider__factory.createInterface();
      const calls: common.Multicall2.CallStruct[] = assetAddresses.map((asset) => ({
        target: getContractAddress(this.chainId, 'PoolDataProvider'),
        callData: iface.encodeFunctionData('getReserveTokensAddresses', [asset]),
      }));

      const { returnData } = await this.multicall2.callStatic.aggregate(calls);

      this.reserveTokensAddresses = [];
      for (let i = 0; i < assetAddresses.length; i++) {
        const assetAddress = assetAddresses[i];
        const { aTokenAddress, stableDebtTokenAddress, variableDebtTokenAddress } = iface.decodeFunctionResult(
          'getReserveTokensAddresses',
          returnData[i]
        );
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
    return this.getToken(aTokenAddress);
  }

  async toAsset(aToken: common.Token) {
    const contract = AToken__factory.connect(aToken.address, this.provider);
    const assetAddress = await contract.UNDERLYING_ASSET_ADDRESS();
    return this.getToken(assetAddress);
  }

  async getDebtTokenAddress(asset: common.Token, interestRateMode: InterestRateMode) {
    const { stableDebtTokenAddress, variableDebtTokenAddress } = await this.poolDataProvider.getReserveTokensAddresses(
      asset.wrapped.address
    );

    return interestRateMode === InterestRateMode.variable ? variableDebtTokenAddress : stableDebtTokenAddress;
  }

  async getFlashLoanPremiumTotal() {
    const PoolAddress = await this.getPoolAddress();
    const Pool = Pool__factory.connect(PoolAddress, this.provider);
    const premium = await Pool.FLASHLOAN_PREMIUM_TOTAL();
    return premium.toNumber();
  }

  async isDelegationApproved(
    account: string,
    delegateeAddress: string,
    assetAmount: common.TokenAmount,
    interestRateMode: InterestRateMode
  ) {
    const debtTokenAddress = await this.getDebtTokenAddress(assetAmount.token, interestRateMode);
    const debtToken = DebtTokenBase__factory.connect(debtTokenAddress, this.provider);
    const borrowAllowance = await debtToken.borrowAllowance(account, delegateeAddress);

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
}

import {
  AToken__factory,
  DebtTokenBase__factory,
  PoolAddressesProvider__factory,
  PoolDataProvider__factory,
  Pool__factory,
} from './contracts';
import { InterestRateMode, ReserveTokens, ReserveTokensAddress } from './types';
import * as common from '@protocolink/common';
import { constants } from 'ethers';
import { getContractAddress } from './configs';

export class Service extends common.Web3Toolkit {
  get poolDataProvider() {
    return PoolDataProvider__factory.connect(getContractAddress(this.chainId, 'PoolDataProvider'), this.provider);
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
}

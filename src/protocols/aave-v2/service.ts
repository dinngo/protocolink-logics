import {
  AToken__factory,
  DebtTokenBase__factory,
  LendingPoolAddressesProvider__factory,
  LendingPool__factory,
  ProtocolDataProvider__factory,
  WETHGateway__factory,
} from './contracts';
import { InterestRateMode, ReserveTokensAddress } from './types';
import * as core from 'src/core';
import { getContractAddress } from './config';
import invariant from 'tiny-invariant';

export class AaveV2Service extends core.Web3Toolkit {
  readonly protocolDataProviderAddress: string;

  constructor(options: core.Web3ToolkitOptions) {
    super(options);
    const { chainId } = options;
    this.protocolDataProviderAddress = getContractAddress(chainId, 'ProtocolDataProvider');
  }

  get protocolDataProvider() {
    return ProtocolDataProvider__factory.connect(this.protocolDataProviderAddress, this.provider);
  }

  private lendingPoolAddress?: string;

  async getLendingPoolAddress() {
    if (!this.lendingPoolAddress) {
      const lendingPoolAddressProviderAddress = await this.protocolDataProvider.ADDRESSES_PROVIDER();
      const lendingPoolAddressProvider = LendingPoolAddressesProvider__factory.connect(
        lendingPoolAddressProviderAddress,
        this.provider
      );
      this.lendingPoolAddress = await lendingPoolAddressProvider.getLendingPool();
    }

    return this.lendingPoolAddress;
  }

  private wethGatewayAddress?: string;

  async getWETHGatewayAddress() {
    if (!this.wethGatewayAddress) {
      const wethGatewayAddress = getContractAddress(this.chainId, 'WETHGateway');
      const wethGateway = WETHGateway__factory.connect(wethGatewayAddress, this.provider);
      const wethGatewayLendingPoolAddress = await wethGateway.getPool();
      const lendingPoolAddress = await this.getLendingPoolAddress();
      invariant(wethGatewayLendingPoolAddress === lendingPoolAddress, `The WETHGateway's Pool address is invalid`);
      this.wethGatewayAddress = wethGatewayAddress;
    }
    return this.wethGatewayAddress;
  }

  private assetAddresses?: string[];

  async getAssetAddresses() {
    if (!this.assetAddresses) {
      const lendingPoolAddress = await this.getLendingPoolAddress();
      const lendingPool = LendingPool__factory.connect(lendingPoolAddress, this.provider);

      const assetAddresses = await lendingPool.getReservesList();

      const iface = ProtocolDataProvider__factory.createInterface();
      const calls: core.contracts.Multicall2.CallStruct[] = assetAddresses.map((assetAddress) => ({
        target: this.protocolDataProviderAddress,
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

      const iface = ProtocolDataProvider__factory.createInterface();
      const calls: core.contracts.Multicall2.CallStruct[] = assetAddresses.map((asset) => ({
        target: this.protocolDataProviderAddress,
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

  private assets?: core.tokens.Token[];

  async getAssets() {
    if (!this.assets) {
      const assetAddresses = await this.getAssetAddresses();
      this.assets = await this.getTokens(assetAddresses);
    }
    return this.assets;
  }

  private aTokens?: core.tokens.Token[];

  async getATokens() {
    if (!this.aTokens) {
      const reserveTokensAddresses = await this.getReserveTokensAddresses();
      const aTokenAddresses = reserveTokensAddresses.map((reserveTokensAddress) => reserveTokensAddress.aTokenAddress);
      this.aTokens = await this.getTokens(aTokenAddresses);
    }
    return this.aTokens;
  }

  async toAToken(asset: core.tokens.Token) {
    const { aTokenAddress } = await this.protocolDataProvider.getReserveTokensAddresses(asset.wrapped().address);
    return this.getToken(aTokenAddress);
  }

  async toAsset(aToken: core.tokens.Token) {
    const contract = AToken__factory.connect(aToken.address, this.provider);
    const assetAddress = await contract.UNDERLYING_ASSET_ADDRESS();
    return this.getToken(assetAddress);
  }

  async getDebtTokenAddress(asset: core.tokens.Token, interestRateMode: InterestRateMode) {
    const { stableDebtTokenAddress, variableDebtTokenAddress } =
      await this.protocolDataProvider.getReserveTokensAddresses(asset.address);

    return interestRateMode === InterestRateMode.variable ? variableDebtTokenAddress : stableDebtTokenAddress;
  }

  async isDelegationApproved(
    account: string,
    delegateeAddress: string,
    assetAmount: core.tokens.TokenAmount,
    interestRateMode: InterestRateMode
  ) {
    const debtTokenAddress = await this.getDebtTokenAddress(assetAmount.token, interestRateMode);
    const debtToken = DebtTokenBase__factory.connect(debtTokenAddress, this.provider);
    const borrowAllowance = await debtToken.borrowAllowance(account, delegateeAddress);

    return borrowAllowance.gte(assetAmount.amountWei);
  }

  async buildApproveDelegationTx(
    delegateeAddress: string,
    assetAmount: core.tokens.TokenAmount,
    interestRateMode: InterestRateMode
  ) {
    const debtTokenAddress = await this.getDebtTokenAddress(assetAmount.token, interestRateMode);
    const debtToken = DebtTokenBase__factory.connect(debtTokenAddress, this.provider);

    return debtToken.populateTransaction.approveDelegation(delegateeAddress, assetAmount.amountWei);
  }

  async getUserCurrentDebt(account: string, asset: core.tokens.Token, interestRateMode: InterestRateMode) {
    const { currentStableDebt, currentVariableDebt } = await this.protocolDataProvider.getUserReserveData(
      asset.address,
      account
    );
    const currentDebt = new core.tokens.TokenAmount(asset);
    currentDebt.setWei(interestRateMode === InterestRateMode.variable ? currentVariableDebt : currentStableDebt);

    return currentDebt;
  }
}

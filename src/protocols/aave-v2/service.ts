import { LendingPool__factory, ProtocolDataProvider__factory } from './contracts';
import { ReserveTokensAddress } from './types';
import * as core from 'src/core';
import { getContractAddress } from './config';

export class AaveV2Service extends core.Web3Toolkit {
  readonly lendingPoolAddress: string;
  readonly protocolDataProviderAddress: string;

  constructor(options: core.Web3ToolkitOptions) {
    super(options);
    const { chainId } = options;
    this.lendingPoolAddress = getContractAddress(chainId, 'LendingPool');
    this.protocolDataProviderAddress = getContractAddress(chainId, 'ProtocolDataProvider');
  }

  get lendingPool() {
    return LendingPool__factory.connect(this.lendingPoolAddress, this.provider);
  }

  get protocolDataProvider() {
    return ProtocolDataProvider__factory.connect(this.protocolDataProviderAddress, this.provider);
  }

  private assetAddresses?: string[];

  async getAssetAddresses() {
    if (!this.assetAddresses) {
      const assetAddresses = await this.lendingPool.getReservesList();

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
}

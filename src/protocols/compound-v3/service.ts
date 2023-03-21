import { Comet__factory } from './contracts';
import * as common from '@composable-router/common';

export class Service extends common.Web3Toolkit {
  async getCollaterals(cTokenOrAddress: common.TokenOrAddress) {
    const cTokenAddress = typeof cTokenOrAddress === 'string' ? cTokenOrAddress : cTokenOrAddress.address;
    const contractComet = Comet__factory.connect(cTokenAddress, this.provider);
    const numAssets = await contractComet.numAssets();

    const ifaceComet = Comet__factory.createInterface();
    const calls: common.Multicall2.CallStruct[] = [];
    for (let i = 0; i < numAssets; i++) {
      calls.push({ target: cTokenAddress, callData: ifaceComet.encodeFunctionData('getAssetInfo', [i]) });
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
}

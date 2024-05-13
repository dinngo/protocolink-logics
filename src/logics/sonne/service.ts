import { Comptroller, Comptroller__factory } from './contracts';
import { ComptrollerInterface } from './contracts/Comptroller';
import * as common from '@protocolink/common';
import { getContractAddress, toCToken } from './configs';

export class Service extends common.Web3Toolkit {
  private _comptroller?: Comptroller;
  get comptroller() {
    if (!this._comptroller) {
      this._comptroller = Comptroller__factory.connect(getContractAddress(this.chainId, 'Comptroller'), this.provider);
    }
    return this._comptroller;
  }

  private _comptrollerIface?: ComptrollerInterface;
  get comptrollerIface() {
    if (!this._comptrollerIface) {
      this._comptrollerIface = Comptroller__factory.createInterface();
    }
    return this._comptrollerIface;
  }

  buildEnterMarketTransactionRequest(collateral: common.Token): common.TransactionRequest {
    const to = this.comptroller.address;
    const cTokenAddress = toCToken(this.chainId, collateral.wrapped.address).address;
    const data = this.comptrollerIface.encodeFunctionData('enterMarkets', [[cTokenAddress]]);

    return { to, data };
  }
}

import { BigNumberish, constants, utils } from 'ethers';
import { Comet__factory } from './contracts';
import { Service } from './service';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { encodeSupplyNativeTokenAction } from './utils';
import { getMarket, getMarkets } from './config';

export type SupplyCollateralLogicFields = core.TokenInFields<{ marketId: string }>;

export type SupplyCollateralLogicOptions = Pick<core.GlobalOptions, 'account'>;

@core.LogicDefinitionDecorator()
export class SupplyCollateralLogic extends core.Logic implements core.LogicTokenListInterface {
  static readonly supportedChainIds = [common.ChainId.mainnet, common.ChainId.polygon];

  async getTokenList() {
    const tokenList: Record<string, common.Token[]> = {};

    const service = new Service(this.chainId, this.provider);
    const markets = getMarkets(this.chainId);
    for (const market of markets) {
      const collaterals = await service.getCollaterals(market.id);
      tokenList[market.id] = collaterals;
    }

    return tokenList;
  }

  async getLogic(fields: SupplyCollateralLogicFields, options: SupplyCollateralLogicOptions) {
    const { marketId, input, amountBps } = fields;
    const { account } = options;

    const market = getMarket(this.chainId, marketId);

    let to: string;
    let data: string;
    let amountOffset: BigNumberish | undefined;
    if (input.token.isNative) {
      to = market.bulker.address;
      data = new utils.Interface(market.bulker.abi).encodeFunctionData('invoke', [
        [market.bulker.actions.supplyNativeToken],
        [encodeSupplyNativeTokenAction(market.cometAddress, account, input.amountWei)],
      ]);
      if (amountBps) amountOffset = constants.MaxUint256;
    } else {
      to = market.cometAddress;
      data = Comet__factory.createInterface().encodeFunctionData('supplyTo', [
        account,
        input.token.address,
        input.amountWei,
      ]);
      if (amountBps) amountOffset = common.getParamOffset(2);
    }
    const inputs = [core.newLogicInput({ input, amountBps, amountOffset })];

    return core.newLogic({ to, data, inputs });
  }
}

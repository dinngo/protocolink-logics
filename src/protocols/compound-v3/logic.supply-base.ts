import { BigNumberish, constants, utils } from 'ethers';
import { Comet__factory } from './contracts';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { getMarket, getMarkets } from './config';

export type SupplyBaseLogicParams = core.TokenToTokenExactInParams<{ marketId: string }>;

export type SupplyBaseLogicFields = core.TokenToTokenExactInFields<{ marketId: string }>;

export type SupplyBaseLogicOptions = Pick<core.GlobalOptions, 'account'>;

@core.LogicDefinitionDecorator()
export class SupplyBaseLogic extends core.Logic implements core.LogicTokenListInterface, core.LogicOracleInterface {
  static readonly supportedChainIds = [common.ChainId.mainnet, common.ChainId.polygon];

  async getTokenList() {
    const tokenList: Record<string, [common.Token, common.Token]> = {};

    const markets = getMarkets(this.chainId);
    for (const market of markets) {
      const addresses = [market.baseTokenAddress, market.cTokenAddress];
      const tokens = await this.getTokens(addresses);
      tokenList[market.id] = [tokens[0].unwrapped, tokens[1]];
    }

    return tokenList;
  }

  async quote(params: SupplyBaseLogicParams) {
    const { input, tokenOut } = params;

    const output = new common.TokenAmount(tokenOut, input.amount);

    return { input, output };
  }

  async getLogic(fields: SupplyBaseLogicFields, options: SupplyBaseLogicOptions) {
    const { marketId, input, amountBps } = fields;

    const market = getMarket(this.chainId, marketId);

    let to: string;
    let data: string;
    let amountOffset: BigNumberish | undefined;
    if (input.token.isNative) {
      to = market.bulker.address;

      const actions = [market.bulker.actions.supplyNativeToken];
      const { account } = options;
      const userAgent = core.calcAccountAgent(this.chainId, account);
      const datas = [
        utils.defaultAbiCoder.encode(
          ['address', 'address', 'uint'],
          [market.cTokenAddress, userAgent, input.amountWei]
        ),
      ];
      data = new utils.Interface(market.bulker.abi).encodeFunctionData('invoke', [actions, datas]);

      if (amountBps) amountOffset = constants.MaxUint256;
    } else {
      to = market.cTokenAddress;
      data = Comet__factory.createInterface().encodeFunctionData('supply', [input.token.address, input.amountWei]);
      if (amountBps) amountOffset = common.getParamOffset(1);
    }
    const inputs = [core.newLogicInput({ input, amountBps, amountOffset })];

    return core.newLogic({ to, data, inputs });
  }
}

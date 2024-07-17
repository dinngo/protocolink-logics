import { Pool__factory } from './contracts';
import { Service } from './service';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { supportedChainIds } from './configs';

export type SupplyLogicTokenList = [common.Token, common.Token][];

export type SupplyLogicParams = core.TokenToTokenExactInParams;

export type SupplyLogicFields = core.TokenToTokenExactInFields<{ referralCode?: number }>;

export type SupplyLogicOptions = Pick<core.GlobalOptions, 'account'>;

export class SupplyLogic
  extends core.Logic
  implements core.LogicTokenListInterface, core.LogicOracleInterface, core.LogicBuilderInterface
{
  static id = 'supply';
  static protocolId = 'aave-v3';
  static readonly supportedChainIds = supportedChainIds;

  async getTokenList() {
    const service = new Service(this.chainId, this.provider);
    const reserveTokens = await service.getSupplyTokens();

    const tokenList: SupplyLogicTokenList = [];
    for (const reserveToken of reserveTokens) {
      if (reserveToken.asset.isWrapped) {
        tokenList.push([reserveToken.asset.unwrapped, reserveToken.aToken]);
      }
      tokenList.push([reserveToken.asset, reserveToken.aToken]);
    }

    return tokenList;
  }

  async quote(params: SupplyLogicParams) {
    const { input, tokenOut } = params;
    const output = new common.TokenAmount(tokenOut, input.amount);

    return { input, output };
  }

  async build(fields: SupplyLogicFields, options: SupplyLogicOptions) {
    const { input, balanceBps, referralCode = 0 } = fields;
    const { account } = options;

    const tokenIn = input.token.wrapped;
    const agent = await this.calcAgent(account);

    const service = new Service(this.chainId, this.provider);
    const to = await service.getPoolAddress();
    const data = Pool__factory.createInterface().encodeFunctionData('supply', [
      tokenIn.address,
      input.amountWei,
      agent,
      referralCode,
    ]);
    const amountOffset = balanceBps ? common.getParamOffset(1) : undefined;
    const inputs = [
      core.newLogicInput({ input: new common.TokenAmount(tokenIn, input.amount), balanceBps, amountOffset }),
    ];
    const wrapMode = input.token.isNative ? core.WrapMode.wrapBefore : core.WrapMode.none;

    return core.newLogic({ to, data, inputs, wrapMode });
  }
}

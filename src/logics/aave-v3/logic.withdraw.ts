import { Pool__factory } from './contracts';
import { Service } from './service';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { supportedChainIds } from './configs';

export type WithdrawLogicTokenList = [common.Token, common.Token][];

export type WithdrawLogicParams = core.TokenToTokenExactInParams;

export type WithdrawLogicFields = core.TokenToTokenExactInFields;

export type WithdrawLogicOptions = Pick<core.GlobalOptions, 'account'>;

export class WithdrawLogic
  extends core.Logic
  implements core.LogicTokenListInterface, core.LogicOracleInterface, core.LogicBuilderInterface
{
  static id = 'withdraw';
  static protocolId = 'aave-v3';
  static readonly supportedChainIds = supportedChainIds;

  async getTokenList() {
    const service = new Service(this.chainId, this.provider);
    const { reserveTokens } = await service.getReserveTokens();

    const tokenList: WithdrawLogicTokenList = [];
    for (const reserveToken of reserveTokens) {
      if (reserveToken.asset.isWrapped) {
        tokenList.push([reserveToken.aToken, reserveToken.asset.unwrapped]);
      }
      tokenList.push([reserveToken.aToken, reserveToken.asset]);
    }

    return tokenList;
  }

  async quote(params: WithdrawLogicParams) {
    const { input, tokenOut } = params;
    const output = new common.TokenAmount(tokenOut, input.amount);

    return { input, output };
  }

  async build(fields: WithdrawLogicFields, options: WithdrawLogicOptions) {
    const { input, output, balanceBps } = fields;
    const { account } = options;

    const tokenOut = output.token.wrapped;
    const agent = await this.calcAgent(account);

    const service = new Service(this.chainId, this.provider);
    const to = await service.getPoolAddress();
    const data = Pool__factory.createInterface().encodeFunctionData('withdraw', [
      tokenOut.address,
      input.amountWei,
      agent,
    ]);
    const amountOffset = balanceBps ? common.getParamOffset(1) : undefined;
    const inputs = [core.newLogicInput({ input, balanceBps, amountOffset })];
    const wrapMode = output.token.isNative ? core.WrapMode.unwrapAfter : core.WrapMode.none;

    return core.newLogic({ to, data, inputs, wrapMode });
  }
}

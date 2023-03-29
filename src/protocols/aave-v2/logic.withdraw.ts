import { BigNumberish } from 'ethers';
import { LendingPool__factory } from './contracts';
import { Service } from './service';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';

export type WithdrawLogicParams = core.TokenToTokenExactInParams;

export type WithdrawLogicFields = core.TokenToTokenExactInFields;

export type WithdrawLogicOptions = Pick<core.GlobalOptions, 'account'>;

@core.LogicDefinitionDecorator()
export class WithdrawLogic extends core.Logic implements core.LogicTokenListInterface, core.LogicOracleInterface {
  static readonly supportedChainIds = [common.ChainId.mainnet, common.ChainId.polygon, common.ChainId.avalanche];

  async getTokenList() {
    const service = new Service(this.chainId, this.provider);
    const reserveTokens = await service.getReserveTokens();

    const tokenList: [common.Token, common.Token][] = [];
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

  async getLogic(fields: WithdrawLogicFields, options: WithdrawLogicOptions) {
    const { input, output, amountBps } = fields;
    const { account } = options;

    const tokenOut = output.token.wrapped;

    const service = new Service(this.chainId, this.provider);
    const to = await service.getLendingPoolAddress();
    const data = LendingPool__factory.createInterface().encodeFunctionData('withdraw', [
      tokenOut.address,
      input.amountWei,
      core.calcAccountAgent(this.chainId, account),
    ]);
    let amountOffset: BigNumberish | undefined;
    if (amountBps) amountOffset = common.getParamOffset(1);
    const inputs = [core.newLogicInput({ input, amountBps, amountOffset })];
    const wrapMode = output.token.isNative ? core.WrapMode.unwrapAfter : core.WrapMode.none;

    return core.newLogic({ to, data, inputs, wrapMode });
  }
}

import { CErc20Immutable__factory, ProtocolinkCallbackExecutor__factory } from './contracts';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { supportedChainIds, toCToken, toExecutor, tokenPairs } from './configs';

export type BorrowLogicTokenList = [common.Token, common.Token][];

export type BorrowLogicFields = core.TokenOutFields<{ smartId: string }>;

export type BorrowLogicOptions = Pick<core.GlobalOptions, 'account'>;

export class BorrowLogic extends core.Logic implements core.LogicTokenListInterface, core.LogicBuilderInterface {
  static id = 'borrow';
  static protocolId = 'sonne';
  static readonly supportedChainIds = supportedChainIds;

  getTokenList() {
    const tokenList: BorrowLogicTokenList = tokenPairs[this.chainId].map(({ underlyingToken, cToken }) => [
      underlyingToken,
      cToken,
    ]);
    return tokenList;
  }

  async build(fields: BorrowLogicFields, options: BorrowLogicOptions) {
    const { output, smartId } = fields;
    const { account } = options;
    const callbackExecutor = toExecutor(this.chainId, smartId);
    const cToken = toCToken(this.chainId, output.token.wrapped);

    const tos = [];
    const datas = [];
    const values = [];

    // encode borrow token
    tos.push(cToken.address);
    datas.push(CErc20Immutable__factory.createInterface().encodeFunctionData('borrow', [output.amountWei]));
    values.push(0);

    // encode transfer token
    tos.push(output.token.address);
    datas.push(
      common.ERC20__factory.createInterface().encodeFunctionData('transfer', [
        await this.calcAgent(account),
        output.amountWei,
      ])
    );
    values.push(0);

    const wrapMode = output.token.isNative ? core.WrapMode.unwrapAfter : core.WrapMode.none;

    const to = callbackExecutor;
    const data = ProtocolinkCallbackExecutor__factory.createInterface().encodeFunctionData('executeFromAgent', [
      tos,
      datas,
      values,
    ]);

    return core.newLogic({ to, data, wrapMode });
  }
}

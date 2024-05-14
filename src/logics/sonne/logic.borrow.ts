import { CErc20Immutable__factory } from './contracts';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import * as smartAccounts from '@protocolink/smart-accounts';
import { supportedChainIds, toCToken, underlyingTokens } from './configs';

export type BorrowLogicTokenList = common.Token[];

export type BorrowLogicFields = core.TokenOutFields<{ smartAccountId: string }>;

export type BorrowLogicOptions = Pick<core.GlobalOptions, 'account'>;

export class BorrowLogic extends core.Logic implements core.LogicTokenListInterface, core.LogicBuilderInterface {
  static id = 'borrow';
  static protocolId = 'sonne';
  static readonly supportedChainIds = supportedChainIds;
  static readonly isEoaNotSupported = true;

  getTokenList() {
    const tokens = underlyingTokens[this.chainId];

    const tokenList: BorrowLogicTokenList = [];
    for (const token of tokens) {
      if (token.isWrapped) {
        tokenList.push(token.unwrapped);
      }
      tokenList.push(token);
    }
    return tokenList;
  }

  async build(fields: BorrowLogicFields, options: BorrowLogicOptions) {
    const { output, smartAccountId } = fields;
    const { account } = options;
    const cToken = toCToken(this.chainId, output.token.wrapped);

    const tos = [];
    const datas = [];
    const values = [];

    // encode borrow token
    tos.push(cToken.address);
    datas.push(CErc20Immutable__factory.createInterface().encodeFunctionData('borrow', [output.amountWei]));
    values.push('0');

    // encode transfer token
    tos.push(output.token.wrapped.address);
    datas.push(
      common.ERC20__factory.createInterface().encodeFunctionData('transfer', [
        await this.calcAgent(account),
        output.amountWei,
      ])
    );
    values.push('0');

    const { to, data } = smartAccounts.encodeSmartAccount(this.chainId, smartAccountId, tos, datas, values);
    const wrapMode = output.token.isNative ? core.WrapMode.unwrapAfter : core.WrapMode.none;

    return core.newLogic({ to, data, wrapMode });
  }
}

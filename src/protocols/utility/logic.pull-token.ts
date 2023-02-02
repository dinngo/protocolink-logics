import { LogicBase, LogicBaseOptions, LogicGlobalOptions } from 'src/core';
import { SpenderERC20Approval__factory } from './contracts';
import { constants } from 'ethers';

export type PullTokenLogicGetLogicOptions = Pick<LogicGlobalOptions, 'funds'>;

export class PullTokenLogic extends LogicBase {
  spender: string;

  constructor(options: LogicBaseOptions<{ spender?: string }>) {
    const { spender, ...others } = options;
    super(others);
    this.spender = spender ? spender : this.routerConfig.erc20Spender;
  }

  async getLogic(options: PullTokenLogicGetLogicOptions) {
    const funds = options.funds.filter((fund) => !fund.token.isNative());
    if (funds.length === 0) throw new Error('funds length should be great than or equal to 1');

    const iface = SpenderERC20Approval__factory.createInterface();
    let data;
    if (funds.length === 1) {
      data = iface.encodeFunctionData('pullToken', [funds[0].token.address, funds[0].amountWei]);
    } else {
      const tokens = [];
      const amounts = [];
      for (const fund of funds) {
        tokens.push(fund.token.address);
        amounts.push(fund.amountWei);
      }
      data = iface.encodeFunctionData('pullTokens', [tokens, amounts]);
    }

    return {
      to: this.spender,
      data,
      inputs: [],
      outputs: [],
      callback: constants.AddressZero,
    };
  }
}

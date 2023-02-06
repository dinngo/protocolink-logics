import { constants } from 'ethers';
import * as rt from 'src/router';

export type RouterDepositLogicGetLogicOptions = Pick<rt.RouterGlobalOptions, 'funds'>;

export class RouterDepositLogic extends rt.logics.LogicBase {
  spender: string;

  constructor(options: rt.logics.LogicBaseOptions<{ spender?: string }>) {
    const { spender, ...others } = options;
    super(others);
    this.spender = spender ? spender : this.routerConfig.erc20Spender;
  }

  async getLogic({ funds }: RouterDepositLogicGetLogicOptions) {
    const iface = rt.contracts.SpenderERC20Approval__factory.createInterface();
    const data =
      funds.length === 1
        ? iface.encodeFunctionData('pullToken', funds.at(0).toValues())
        : iface.encodeFunctionData('pullTokens', funds.toValues());

    return {
      to: this.spender,
      data,
      inputs: [],
      outputs: [],
      callback: constants.AddressZero,
    };
  }
}

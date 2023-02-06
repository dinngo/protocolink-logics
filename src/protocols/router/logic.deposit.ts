import { constants } from 'ethers';
import * as rt from 'src/router';

export type RouterDepositLogicGetLogicOptions = Pick<rt.RouterGlobalOptions, 'funds'>;

export class RouterDepositLogic extends rt.logics.LogicBase {
  spenderAddress: string;

  constructor(options: rt.logics.LogicBaseOptions<{ spenderAddress?: string }>) {
    const { spenderAddress: spenderAddress, ...others } = options;
    super(others);
    this.spenderAddress = spenderAddress ? spenderAddress : this.routerConfig.erc20SpenderAddress;
  }

  async getLogic({ funds }: RouterDepositLogicGetLogicOptions) {
    const iface = rt.contracts.SpenderERC20Approval__factory.createInterface();
    const data =
      funds.length === 1
        ? iface.encodeFunctionData('pullToken', funds.at(0).toValues())
        : iface.encodeFunctionData('pullTokens', funds.toValues());

    return {
      to: this.spenderAddress,
      data,
      inputs: [],
      outputs: [],
      callback: constants.AddressZero,
    };
  }
}

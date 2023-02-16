import { IAllowanceTransfer } from './contracts/SpenderPermit2ERC20';
import { SpenderPermit2ERC20__factory } from './contracts';
import { getContractAddress } from './config';
import * as rt from 'src/router';

export type RouterPullTokenLogicGetLogicOptions = Pick<
  rt.RouterGlobalOptions,
  'account' | 'routerAddress' | 'erc20Funds'
>;

export class RouterPullTokenLogic extends rt.logics.LogicBase {
  spenderAddress: string;

  constructor(options: rt.logics.LogicBaseOptions<{ spenderAddress?: string }>) {
    const { spenderAddress, ...others } = options;
    super(others);
    this.spenderAddress = spenderAddress ?? getContractAddress(this.chainId, 'SpenderPermit2ERC20');
  }

  async getLogic(options: RouterPullTokenLogicGetLogicOptions) {
    const { account, routerAddress, erc20Funds } = options;

    const to = this.spenderAddress;
    const iface = SpenderPermit2ERC20__factory.createInterface();
    let data: string;
    if (erc20Funds.length === 1) {
      data = iface.encodeFunctionData('pullToken', erc20Funds.at(0).toValues());
    } else {
      const details: IAllowanceTransfer.AllowanceTransferDetailsStruct[] = [];
      for (const fund of erc20Funds.toArray()) {
        details.push({ from: account, to: routerAddress, token: fund.token.address, amount: fund.amountWei });
      }
      data = iface.encodeFunctionData('pullTokens', [details]);
    }

    return rt.logics.newLogic({ to, data });
  }
}

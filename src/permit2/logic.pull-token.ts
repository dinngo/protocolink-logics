import { IAllowanceTransfer } from './contracts/Permit2';
import { Permit2__factory } from './contracts';
import * as common from '@furucombo/composable-router-common';
import * as core from '@furucombo/composable-router-core';
import { getContractAddress } from './config';

export type PullTokenLogicFields = core.TokensInFields;

export type PullTokenLogicOptions = Pick<core.GlobalOptions, 'account'>;

@core.LogicDefinitionDecorator()
export class PullTokenLogic extends core.Logic {
  static readonly supportedChainIds = [
    common.ChainId.mainnet,
    common.ChainId.polygon,
    common.ChainId.arbitrum,
    common.ChainId.optimism,
    common.ChainId.avalanche,
  ];

  async build(fields: PullTokenLogicFields, options: PullTokenLogicOptions) {
    const { inputs } = fields;
    const { account } = options;
    const userAgent = core.calcAccountAgent(this.chainId, account);

    const to = getContractAddress(this.chainId, 'Permit2');
    const iface = Permit2__factory.createInterface();
    let data: string;
    if (inputs.length === 1) {
      const input = inputs.at(0);
      data = iface.encodeFunctionData('transferFrom(address,address,uint160,address)', [
        account,
        userAgent,
        input.amountWei,
        input.token.address,
      ]);
    } else {
      const details: IAllowanceTransfer.AllowanceTransferDetailsStruct[] = inputs.map((input) => ({
        from: account,
        to: userAgent,
        amount: input.amountWei,
        token: input.token.address,
      }));
      data = iface.encodeFunctionData('transferFrom((address,address,uint160,address)[])', [details]);
    }

    return core.newLogic({ to, data });
  }
}

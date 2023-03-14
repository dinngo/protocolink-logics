import { IAllowanceTransfer } from './contracts/SpenderPermit2ERC20';
import { SpenderPermit2ERC20__factory } from './contracts';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
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

  async getLogic(fields: PullTokenLogicFields, options: PullTokenLogicOptions) {
    const { inputs } = fields;
    const { account } = options;

    const to = getContractAddress(this.chainId, 'SpenderPermit2ERC20');
    const iface = SpenderPermit2ERC20__factory.createInterface();
    let data: string;
    if (inputs.length === 1) {
      data = iface.encodeFunctionData('pullToken', inputs.at(0).toValues());
    } else {
      const details: IAllowanceTransfer.AllowanceTransferDetailsStruct[] = inputs.map((input) => ({
        from: account,
        to: core.calcAccountAgent(this.chainId, account),
        token: input.token.address,
        amount: input.amountWei,
      }));
      data = iface.encodeFunctionData('pullTokens', [details]);
    }

    return core.newLogic({ to, data });
  }
}

import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { get1InchTokens, getMetisTokens } from 'src/utils';
import { supportedChainIds } from './configs';

export type PullTokenLogicTokenList = common.Token[];

export type PullTokenLogicFields = core.TokenInFields;

export type PullTokenLogicOptions = Pick<core.GlobalOptions, 'account'>;

@core.LogicDefinitionDecorator()
export class PullTokenLogic extends core.Logic implements core.LogicBuilderInterface {
  static readonly supportedChainIds = supportedChainIds;

  async getTokenList(): Promise<PullTokenLogicTokenList> {
    return this.chainId === common.ChainId.metis ? getMetisTokens() : get1InchTokens(this.chainId);
  }

  async build(fields: PullTokenLogicFields, options: PullTokenLogicOptions) {
    const { input } = fields;
    const { account } = options;
    const userAgent = await this.calcAgent(account);
    const to = await this.getPermit2Address();
    const data = this.permit2Iface.encodeFunctionData('transferFrom(address,address,uint160,address)', [
      account,
      userAgent,
      input.amountWei,
      input.token.address,
    ]);

    return core.newLogic({ to, data });
  }
}

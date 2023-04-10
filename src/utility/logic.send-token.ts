import { BigNumberish, constants, utils } from 'ethers';
import { axios } from 'src/http';
import * as common from '@furucombo/composable-router-common';
import * as core from '@furucombo/composable-router-core';

export type SendTokenLogicTokenList = common.Token[];

export type SendTokenLogicFields = core.TokenToUserFields;

@core.LogicDefinitionDecorator()
export class SendTokenLogic extends core.Logic implements core.LogicTokenListInterface {
  static readonly supportedChainIds = [
    common.ChainId.mainnet,
    common.ChainId.polygon,
    common.ChainId.arbitrum,
    common.ChainId.optimism,
    common.ChainId.avalanche,
    common.ChainId.fantom,
  ];

  async getTokenList() {
    const { data } = await axios.get<{
      tokens: Record<string, { symbol: string; name: string; decimals: number; address: string }>;
    }>(`https://api.1inch.io/v5.0/${this.chainId}/tokens`);

    const tokenList: SendTokenLogicTokenList = [];
    Object.keys(data.tokens).forEach((key) => {
      const token = data.tokens[key];
      const address = utils.getAddress(token.address);
      tokenList.push(
        address === common.ELASTIC_ADDRESS
          ? this.nativeToken
          : new common.Token(this.chainId, address, token.decimals, token.symbol, token.name)
      );
    });

    return tokenList;
  }

  async build(fields: SendTokenLogicFields) {
    const { input, recipient, amountBps } = fields;

    let to: string;
    let data: string;
    let amountOffset: BigNumberish | undefined;
    if (input.token.isNative) {
      to = recipient;
      data = '0x';
      if (amountBps) amountOffset = constants.MaxUint256;
    } else {
      to = input.token.address;
      data = common.ERC20__factory.createInterface().encodeFunctionData('transfer', [recipient, input.amountWei]);
      if (amountBps) amountOffset = common.getParamOffset(1);
    }
    const inputs = [core.newLogicInput({ input, amountBps, amountOffset })];

    return core.newLogic({ to, data, inputs });
  }
}

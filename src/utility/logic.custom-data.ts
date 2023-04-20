import * as common from '@furucombo/composable-router-common';
import * as core from '@furucombo/composable-router-core';

export interface CustomDataLogicFields {
  inputs?: common.TokenAmounts;
  outputs?: common.TokenAmounts;
  to: string;
  data: string;
}

@core.LogicDefinitionDecorator()
export class CustomDataLogic extends core.Logic implements core.LogicBuilderInterface {
  static readonly supportedChainIds = [
    common.ChainId.mainnet,
    common.ChainId.polygon,
    common.ChainId.arbitrum,
    common.ChainId.optimism,
    common.ChainId.avalanche,
    common.ChainId.fantom,
  ];

  async build(fields: CustomDataLogicFields) {
    const { to, data } = fields;

    const inputs = fields.inputs?.map((input) => core.newLogicInput({ input }));

    return core.newLogic({ to, data, inputs });
  }
}

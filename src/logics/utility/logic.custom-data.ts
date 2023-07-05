import * as common from '@protocolink/common';
import * as core from '@protocolink/core';

export interface CustomDataLogicFields {
  inputs?: common.TokenAmounts;
  outputs?: common.TokenAmounts;
  to: string;
  data: string;
}

@core.LogicDefinitionDecorator()
export class CustomDataLogic extends core.Logic implements core.LogicBuilderInterface {
  static readonly supportedChainIds = common.networks.map(({ chainId }) => chainId);

  async build(fields: CustomDataLogicFields) {
    const { to, data } = fields;

    const inputs = fields.inputs?.map((input) => core.newLogicInput({ input }));

    return core.newLogic({ to, data, inputs });
  }
}

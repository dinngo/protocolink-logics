import * as aavev2 from '../aave-v2';
import * as aavev3 from '../aave-v3';
import * as balancerv2 from '../balancer-v2';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import invariant from 'tiny-invariant';
import * as radiantv2 from '../radiant-v2';
import * as spark from '../spark';

export const supportedFlashLoanLogics = [
  aavev2.FlashLoanLogic,
  aavev3.FlashLoanLogic,
  balancerv2.FlashLoanLogic,
  radiantv2.FlashLoanLogic,
  spark.FlashLoanLogic,
];

export type FlashLoanAggregatorLogicTokenList = common.Token[];

export type FlashLoanAggregatorLogicParams = core.FlashLoanParams<{ protocolId?: string }>;

export type FlashLoanAggregatorLogicQuotation = core.FlashLoanQuotation<{ protocolId: string; callback: string }>;

export type FlashLoanAggregatorLogicFields = core.FlashLoanFields<{ protocolId: string; referralCode?: number }>;

@core.LogicDefinitionDecorator()
export class FlashLoanAggregatorLogic
  extends core.Logic
  implements core.LogicTokenListInterface, core.LogicBuilderInterface
{
  static readonly supportedChainIds = Array.from(
    supportedFlashLoanLogics.reduce((accumulator, FlashLoanLogic) => {
      for (const chainId of FlashLoanLogic.supportedChainIds) {
        accumulator.add(chainId);
      }
      return accumulator;
    }, new Set<number>())
  );

  async calcCallbackFee(protocolId: string, loan: common.TokenAmount) {
    const FlashLoanLogic = supportedFlashLoanLogics.find((Logic) => Logic.protocolId === protocolId)!;
    const flashLoanLogic = new FlashLoanLogic(this.chainId, this.provider);
    const callbackFee = await flashLoanLogic.calcCallbackFee(loan);

    return callbackFee;
  }

  async getTokenList() {
    const flashLoanLogics = supportedFlashLoanLogics.filter((FlashLoanLogic) =>
      FlashLoanLogic.supportedChainIds.includes(this.chainId)
    );
    const allTokens = await Promise.all(
      flashLoanLogics.map((FlashLoanLogic) => {
        const flashLoanLogic = new FlashLoanLogic(this.chainId, this.provider);
        return flashLoanLogic.getTokenList();
      })
    );
    const tmp: Record<string, boolean> = {};
    const tokenList: FlashLoanAggregatorLogicTokenList = [];
    for (const tokens of allTokens) {
      for (const token of tokens) {
        if (tmp[token.address]) continue;
        tokenList.push(token);
        tmp[token.address] = true;
      }
    }

    return tokenList;
  }

  async quote(params: FlashLoanAggregatorLogicParams) {
    const { protocolId, ...others } = params;

    const flashLoanLogics = supportedFlashLoanLogics.filter((FlashLoanLogic) =>
      protocolId ? FlashLoanLogic.protocolId === protocolId : FlashLoanLogic.supportedChainIds.includes(this.chainId)
    );

    const quotations: FlashLoanAggregatorLogicQuotation[] = [];
    await Promise.all(
      flashLoanLogics.map(async (FlashLoanLogic) => {
        const flashLoanLogic = new FlashLoanLogic(this.chainId, this.provider);
        try {
          const quotation = await flashLoanLogic.quote(others);
          quotations.push({
            protocolId: FlashLoanLogic.protocolId,
            callback: flashLoanLogic.callbackAddress,
            ...quotation,
          });
        } catch {}
      })
    );

    let quotation: FlashLoanAggregatorLogicQuotation | undefined;
    for (let i = 0; i < quotations.length; i++) {
      if (!quotation || quotations[i].feeBps < quotation.feeBps) {
        quotation = quotations[i];
      }
    }

    invariant(!!quotation, 'no suitable flash loan found');

    return quotation;
  }

  async build(fields: FlashLoanAggregatorLogicFields) {
    const { protocolId, ...others } = fields;
    const FlashLoanLogic = supportedFlashLoanLogics.find((Logic) => Logic.protocolId === protocolId)!;
    const routerLogic = await new FlashLoanLogic(this.chainId, this.provider).build(others);

    return routerLogic;
  }
}

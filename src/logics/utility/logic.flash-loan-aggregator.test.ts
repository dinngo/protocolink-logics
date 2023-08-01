import { FlashLoanAggregatorLogic } from './logic.flash-loan-aggregator';
import * as common from '@protocolink/common';
import { expect } from 'chai';

describe('Utility FlashLoanAggregatorLogic', function () {
  context('Test getTokenList', async function () {
    FlashLoanAggregatorLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.toNetworkId(chainId)}`, async function () {
        const logic = new FlashLoanAggregatorLogic(chainId);
        const tokenList = await logic.getTokenList();
        expect(tokenList).to.have.lengthOf.above(0);
      });
    });
  });
});

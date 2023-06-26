import { MultiSendLogic } from './logic.multi-send';
import * as common from '@protocolink/common';
import { expect } from 'chai';

describe('Utility MultiSendLogic', function () {
  context('Test getTokenList', async function () {
    MultiSendLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.getNetworkId(chainId)}`, async function () {
        const logic = new MultiSendLogic(chainId);
        const tokenList = await logic.getTokenList();
        expect(tokenList).to.have.lengthOf.above(0);
      });
    });
  });
});

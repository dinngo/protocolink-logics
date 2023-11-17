import { LogicTestCase } from 'test/types';
import { PullTokenLogic, PullTokenLogicFields } from './logic.pull-token';
import * as common from '@protocolink/common';
import { constants, utils } from 'ethers';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import { mainnetTokens } from '@protocolink/test-helpers';

describe('Permit2 PullTokenLogic', function () {
  const chainId = common.ChainId.mainnet;
  const logic = new PullTokenLogic(chainId);

  context('Test build', function () {
    const routerKit = new core.RouterKit(chainId);
    const account = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';
    const iface = routerKit.permit2Iface;

    const testCases: LogicTestCase<PullTokenLogicFields>[] = [
      { fields: { input: new common.TokenAmount(mainnetTokens.WETH, '1') } },
    ];

    testCases.forEach(({ fields }, i) => {
      it(`case ${i + 1}`, async function () {
        const routerLogic = await logic.build(fields, { account });
        const sig = routerLogic.data.substring(0, 10);
        const permit2Address = await routerKit.getPermit2Address();

        expect(routerLogic.to).to.eq(permit2Address);
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        expect(sig).to.eq(iface.getSighash('transferFrom(address,address,uint160,address)'));
        expect(routerLogic.inputs).to.deep.eq([]);
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

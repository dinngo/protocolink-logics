import { COMP, getContractAddress } from './configs';
import { ClaimLogic, ClaimLogicFields } from './logic.claim';
import { Comptroller__factory } from './contracts';
import { LogicTestCase } from 'test/types';
import * as common from '@protocolink/common';
import { constants, utils } from 'ethers';
import { expect } from 'chai';

describe('CompoundV2 ClaimLogic', function () {
  context('Test getTokenList', async function () {
    ClaimLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.toNetworkId(chainId)}`, async function () {
        const logic = new ClaimLogic(chainId);
        const tokenList = await logic.getTokenList();
        expect(tokenList).to.have.lengthOf.above(0);
      });
    });
  });

  context('Test build', function () {
    const chainId = common.ChainId.mainnet;
    const logic = new ClaimLogic(chainId);
    const iface = Comptroller__factory.createInterface();

    const testCases: LogicTestCase<ClaimLogicFields>[] = [
      { fields: { owner: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa', output: new common.TokenAmount(COMP, '1') } },
    ];

    testCases.forEach(({ fields }, i) => {
      it(`case ${i + 1}`, async function () {
        const routerLogic = await logic.build(fields);
        const sig = routerLogic.data.substring(0, 10);

        expect(routerLogic.to).to.eq(getContractAddress('Comptroller'));
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        expect(sig).to.eq(iface.getSighash('claimComp(address)'));
        expect(routerLogic.inputs).to.deep.eq([]);
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

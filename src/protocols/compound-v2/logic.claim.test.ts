import { COMP } from './tokens';
import { ClaimLogic, ClaimLogicFields } from './logic.claim';
import { Comptroller__factory } from './contracts';
import { LogicTestCase } from 'test/types';
import * as common from '@composable-router/common';
import { constants, utils } from 'ethers';
import { expect } from 'chai';
import { getContractAddress } from './config';

describe('CompoundV2 ClaimLogic', function () {
  context('Test getTokenList', async function () {
    ClaimLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.getNetworkId(chainId)}`, async function () {
        const claimCOMPLogic = new ClaimLogic(chainId);
        const tokens = await claimCOMPLogic.getTokenList();
        expect(tokens.length).to.be.gt(0);
      });
    });
  });

  context('Test getLogic', function () {
    const chainId = common.ChainId.mainnet;
    const compoundV2ClaimLogic = new ClaimLogic(chainId);
    const comptroller = Comptroller__factory.createInterface();

    const testCases: LogicTestCase<ClaimLogicFields>[] = [
      { fields: { owner: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa', output: new common.TokenAmount(COMP, '1') } },
    ];

    testCases.forEach(({ fields }, i) => {
      it(`case ${i + 1}`, async function () {
        const routerLogic = await compoundV2ClaimLogic.getLogic(fields);
        const sig = routerLogic.data.substring(0, 10);

        expect(routerLogic.to).to.eq(getContractAddress('Comptroller'));
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        expect(sig).to.eq(comptroller.getSighash('claimComp(address)'));
        expect(routerLogic.inputs).to.deep.eq([]);
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

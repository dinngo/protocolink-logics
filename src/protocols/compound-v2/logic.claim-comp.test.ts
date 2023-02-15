import { CompoundV2ClaimCOMPLogic } from './logic.claim-comp';
import { Comptroller__factory } from './contracts';
import { constants, utils } from 'ethers';
import * as core from 'src/core';
import { expect } from 'chai';
import { getContractAddress } from './config';

describe('CompoundV2ClaimCOMPLogic', function () {
  const chainId = core.network.ChainId.mainnet;
  const compoundV2ClaimCOMP = new CompoundV2ClaimCOMPLogic({ chainId });

  context('Test getLogic', function () {
    const comptroller = Comptroller__factory.createInterface();

    const cases = [{ holder: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' }];

    cases.forEach(({ holder }, i) => {
      it(`case ${i + 1}`, async function () {
        const logic = await compoundV2ClaimCOMP.getLogic({ holder });
        const sig = logic.data.substring(0, 10);

        expect(logic.to).to.eq(getContractAddress('Comptroller'));
        expect(utils.isBytesLike(logic.data)).to.be.true;
        expect(sig).to.eq(comptroller.getSighash('claimComp(address)'));
        expect(logic.inputs).to.deep.eq([]);
        expect(logic.outputs).to.deep.eq([]);
        expect(logic.approveTo).to.eq(constants.AddressZero);
        expect(logic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

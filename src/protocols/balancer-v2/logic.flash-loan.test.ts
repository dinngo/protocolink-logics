import { BalancerV2FlashLoanLogic } from './logic.flash-loan';
import { Vault__factory } from './contracts';
import { constants, utils } from 'ethers';
import * as core from 'src/core';
import { expect } from 'chai';
import { getContractAddress } from './config';

describe('BalancerV2FlashLoanLogic', function () {
  const chainId = core.network.ChainId.mainnet;
  const aavev2FlashLoanLogic = new BalancerV2FlashLoanLogic({ chainId });

  context('Test getLogic', function () {
    const vaultIface = Vault__factory.createInterface();

    const cases = [
      {
        outputs: [
          new core.tokens.TokenAmount(core.tokens.mainnet.WETH, '1'),
          new core.tokens.TokenAmount(core.tokens.mainnet.USDC, '1'),
        ],
        userData: '0x',
      },
    ];

    cases.forEach(({ outputs, userData }) => {
      it(`flash loan ${outputs.map((output) => output.token.symbol).join(',')}`, async function () {
        const logic = await aavev2FlashLoanLogic.getLogic({ outputs, userData });
        const sig = logic.data.substring(0, 10);

        expect(utils.isBytesLike(logic.data)).to.be.true;

        expect(logic.to).to.eq(getContractAddress(chainId, 'Vault'));
        expect(sig).to.eq(vaultIface.getSighash('flashLoan'));
        expect(logic.inputs).to.deep.eq([]);
        expect(logic.outputs).to.deep.eq([]);
        expect(logic.approveTo).to.eq(constants.AddressZero);
        expect(logic.callback).to.eq(aavev2FlashLoanLogic.callbackAddress);
      });
    });
  });
});

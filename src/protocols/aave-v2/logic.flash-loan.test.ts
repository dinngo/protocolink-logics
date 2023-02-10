import { AaveV2FlashLoanLogic } from './logic.flash-loan';
import { LendingPool__factory } from './contracts';
import * as core from 'src/core';
import { expect } from 'chai';
import { mainnet } from './tokens/data';
import { utils } from 'ethers';

describe('AaveV2FlashLoanLogic', function () {
  const chainId = core.network.ChainId.mainnet;
  const aavev2FlashLoanLogic = new AaveV2FlashLoanLogic({ chainId });

  context('Test getLogic', function () {
    const lendingPoolIface = LendingPool__factory.createInterface();

    const cases = [
      {
        outputs: [new core.tokens.TokenAmount(mainnet.WETH, '1'), new core.tokens.TokenAmount(mainnet.USDC, '1')],
        params: '0x',
      },
    ];

    cases.forEach(({ outputs, params }) => {
      it(`flash loan ${outputs.map((output) => output.token.symbol).join(',')}`, async function () {
        const logic = await aavev2FlashLoanLogic.getLogic({ outputs, params });
        const sig = logic.data.substring(0, 10);

        expect(utils.isBytesLike(logic.data)).to.be.true;

        const lendingPoolAddress = await aavev2FlashLoanLogic.service.getLendingPoolAddress();
        expect(logic.to).to.eq(lendingPoolAddress);
        expect(sig).to.eq(lendingPoolIface.getSighash('flashLoan'));
        expect(logic.inputs).to.deep.eq([]);
        expect(logic.outputs).to.deep.eq([]);
        expect(logic.callback).to.eq(aavev2FlashLoanLogic.callbackAddress);
      });
    });
  });
});

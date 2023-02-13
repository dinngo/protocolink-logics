import { AaveV2RepayLogic } from './logic.repay';
import { InterestRateMode } from './types';
import { LendingPool__factory } from './contracts';
import { constants, utils } from 'ethers';
import * as core from 'src/core';
import { expect } from 'chai';
import { mainnet } from './tokens/data';

describe('AaveV2RepayLogic', function () {
  const chainId = core.network.ChainId.mainnet;
  const aavev2RepayLogic = new AaveV2RepayLogic({ chainId });

  context('Test getLogic', function () {
    const lendingPoolIface = LendingPool__factory.createInterface();

    const cases = [
      {
        account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
        input: new core.tokens.TokenAmount(mainnet.WETH, '1'),
        interestRateMode: InterestRateMode.variable,
      },
      {
        account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
        input: new core.tokens.TokenAmount(mainnet.USDC, '1'),
        interestRateMode: InterestRateMode.variable,
      },
      {
        account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
        input: new core.tokens.TokenAmount(mainnet.WETH, '1'),
        interestRateMode: InterestRateMode.variable,
        amountBps: 5000,
      },
      {
        account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
        input: new core.tokens.TokenAmount(mainnet.USDC, '1'),
        interestRateMode: InterestRateMode.variable,
        amountBps: 5000,
      },
    ];

    cases.forEach(({ account, input, interestRateMode, amountBps }) => {
      it(`repay ${input.token.symbol}${amountBps ? ' with amountBps' : ''}`, async function () {
        const logic = await aavev2RepayLogic.getLogic({ account, input, interestRateMode, amountBps });
        const sig = logic.data.substring(0, 10);

        expect(utils.isBytesLike(logic.data)).to.be.true;
        const lendingPoolAddress = await aavev2RepayLogic.service.getLendingPoolAddress();
        expect(logic.to).to.eq(lendingPoolAddress);
        expect(sig).to.eq(lendingPoolIface.getSighash('repay'));
        if (amountBps) {
          expect(logic.inputs[0].amountBps).to.eq(amountBps);
          expect(logic.inputs[0].amountOrOffset).to.eq(core.utils.getParamOffset(1));
        } else {
          expect(logic.inputs[0].amountBps).to.eq(constants.MaxUint256);
          expect(logic.inputs[0].amountOrOffset).eq(input.amountWei);
        }
        expect(logic.outputs).to.deep.eq([]);
        expect(logic.approveTo).to.eq(constants.AddressZero);
        expect(logic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

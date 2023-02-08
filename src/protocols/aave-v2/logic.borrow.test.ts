import { AaveV2BorrowLogic } from './logic.borrow';
import { InterestRateMode } from './types';
import { constants, utils } from 'ethers';
import * as core from 'src/core';
import { expect } from 'chai';
import { mainnet } from './tokens/data';
import * as rt from 'src/router';

describe('AaveV2BorrowLogic', function () {
  const chainId = core.network.ChainId.mainnet;
  const aavev2BorrowLogic = new AaveV2BorrowLogic({ chainId });

  context('Test getLogic', function () {
    const spenderAaveV2Delegation = rt.contracts.SpenderAaveV2Delegation__factory.createInterface();

    const cases = [
      // TODO: wait for aave v2 spender contract implement borrowETH
      // {
      //   output: new core.tokens.TokenAmount(core.tokens.mainnet.ETH, '1'),
      //   interestRateMode: InterestRate.variable,
      // },
      {
        output: new core.tokens.TokenAmount(mainnet.WETH, '1'),
        interestRateMode: InterestRateMode.variable,
      },
      {
        output: new core.tokens.TokenAmount(mainnet.USDC, '1'),
        interestRateMode: InterestRateMode.variable,
      },
    ];

    cases.forEach(({ output, interestRateMode }) => {
      it(`borrow ${output.token.symbol}`, async function () {
        const logic = await aavev2BorrowLogic.getLogic({ output, interestRateMode });
        const sig = logic.data.substring(0, 10);

        expect(utils.isBytesLike(logic.data)).to.be.true;
        expect(logic.to).to.eq(rt.config.getContractAddress(chainId, 'SpenderAaveV2Delegation'));
        if (output.token.isNative()) {
          expect(sig).to.eq(spenderAaveV2Delegation.getSighash('borrowETH'));
        } else {
          expect(sig).to.eq(spenderAaveV2Delegation.getSighash('borrow'));
        }
        expect(logic.inputs).to.deep.eq([]);
        expect(logic.outputs[0].token).to.eq(output.token.address);
        expect(logic.outputs[0].amountMin).to.eq(output.amountWei);
        expect(logic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

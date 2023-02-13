import { CErc20__factory, CEther__factory } from './contracts';
import { CompoundV2RepayLogic } from './logic.repay';
import { constants, utils } from 'ethers';
import * as core from 'src/core';
import { expect } from 'chai';
import { toCToken, underlyingTokens } from './tokens';

describe('CompoundV2RepayLogic', function () {
  const chainId = core.network.ChainId.mainnet;
  const compoundV2Repay = new CompoundV2RepayLogic({ chainId });

  context('Test getLogic', function () {
    const cEther = CEther__factory.createInterface();
    const cErc20 = CErc20__factory.createInterface();

    const cases = [
      {
        borrower: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
        input: new core.tokens.TokenAmount(underlyingTokens.ETH, '1'),
      },
      {
        borrower: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
        input: new core.tokens.TokenAmount(underlyingTokens.USDC, '1'),
      },
      {
        borrower: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
        input: new core.tokens.TokenAmount(underlyingTokens.ETH, '1'),
        amountBps: 5000,
      },
      {
        borrower: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
        input: new core.tokens.TokenAmount(underlyingTokens.USDC, '1'),
        amountBps: 5000,
      },
    ];

    cases.forEach(({ borrower, input, amountBps }) => {
      it(`repay ${input.token.symbol}${amountBps ? ' with amountBps' : ''}`, async function () {
        const logic = await compoundV2Repay.getLogic({ borrower, input, amountBps });
        const sig = logic.data.substring(0, 10);

        expect(logic.to).to.eq(toCToken(input.token).address);
        expect(utils.isBytesLike(logic.data)).to.be.true;
        if (input.token.isNative()) {
          expect(sig).to.eq(cEther.getSighash('repayBorrowBehalf'));
          expect(logic.inputs[0].token).to.eq(core.tokens.ELASTIC_ADDRESS);
        } else {
          expect(sig).to.eq(cErc20.getSighash('repayBorrowBehalf'));
        }
        if (amountBps) {
          expect(logic.inputs[0].amountBps).to.eq(amountBps);
          expect(logic.inputs[0].amountOrOffset).to.eq(input.token.isNative() ? constants.MaxUint256 : 32);
        } else {
          expect(logic.inputs[0].amountBps).to.eq(constants.MaxUint256);
          expect(logic.inputs[0].amountOrOffset).to.eq(input.amountWei);
        }
        expect(logic.outputs).to.deep.eq([]);
        expect(logic.approveTo).to.eq(constants.AddressZero);
        expect(logic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

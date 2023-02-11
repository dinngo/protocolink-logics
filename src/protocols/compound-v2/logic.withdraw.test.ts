import { CErc20__factory } from './contracts';
import { CompoundV2WithdrawLogic } from './logic.withdraw';
import { cTokens, underlyingTokens } from './tokens';
import { constants, utils } from 'ethers';
import * as core from 'src/core';
import { expect } from 'chai';

describe('CompoundV2WithdrawLogic', function () {
  const chainId = core.network.ChainId.mainnet;
  const compoundV2Withdraw = new CompoundV2WithdrawLogic({ chainId });

  context('Test getPrice', function () {
    const cases = [
      { input: new core.tokens.TokenAmount(cTokens.cETH, '1'), tokenOut: underlyingTokens.ETH },
      { input: new core.tokens.TokenAmount(cTokens.cUSDC, '1'), tokenOut: underlyingTokens.USDC },
    ];

    cases.forEach(({ input, tokenOut }) => {
      it(`${input.token.symbol} to ${tokenOut.symbol}`, async function () {
        const output = await compoundV2Withdraw.getPrice({ input, tokenOut });
        expect(output.amountWei.gt(0)).to.be.true;
      });
    });
  });

  context('Test getLogic', function () {
    const cErc20 = CErc20__factory.createInterface();

    const cases = [
      {
        input: new core.tokens.TokenAmount(cTokens.cETH, '1'),
        output: new core.tokens.TokenAmount(underlyingTokens.ETH),
      },
      {
        input: new core.tokens.TokenAmount(cTokens.cUSDC, '1'),
        output: new core.tokens.TokenAmount(underlyingTokens.USDC),
      },
      {
        input: new core.tokens.TokenAmount(cTokens.cETH, '1'),
        output: new core.tokens.TokenAmount(underlyingTokens.ETH),
        amountBps: 5000,
      },
      {
        input: new core.tokens.TokenAmount(cTokens.cUSDC, '1'),
        output: new core.tokens.TokenAmount(underlyingTokens.USDC),
        amountBps: 5000,
      },
    ];

    cases.forEach(({ input, output, amountBps }) => {
      it(`${input.token.symbol} to ${output.token.symbol}${amountBps ? ' with amountBps' : ''}`, async function () {
        const logic = await compoundV2Withdraw.getLogic({ input, output, amountBps });
        const sig = logic.data.substring(0, 10);

        expect(logic.to).to.eq(input.token.address);
        expect(utils.isBytesLike(logic.data)).to.be.true;
        expect(sig).to.eq(cErc20.getSighash('redeem'));
        if (amountBps) {
          expect(logic.inputs[0].amountBps).to.eq(amountBps);
          expect(logic.inputs[0].amountOrOffset).to.eq(0);
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

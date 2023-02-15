import { CErc20__factory, CEther__factory } from './contracts';
import { CompoundV2SupplyLogic } from './logic.supply';
import { cTokens, underlyingTokens } from './tokens';
import { constants, utils } from 'ethers';
import * as core from 'src/core';
import { expect } from 'chai';

describe('CompoundV2SupplyLogic', function () {
  const chainId = core.network.ChainId.mainnet;
  const compoundV2Supply = new CompoundV2SupplyLogic({ chainId });

  context('Test getLogic', function () {
    const cEther = CEther__factory.createInterface();
    const cErc20 = CErc20__factory.createInterface();

    const cases = [
      {
        input: new core.tokens.TokenAmount(underlyingTokens.ETH, '1'),
        output: new core.tokens.TokenAmount(cTokens.cETH),
      },
      {
        input: new core.tokens.TokenAmount(underlyingTokens.USDC, '1'),
        output: new core.tokens.TokenAmount(cTokens.cUSDC),
      },
      {
        input: new core.tokens.TokenAmount(underlyingTokens.ETH, '1'),
        output: new core.tokens.TokenAmount(cTokens.cETH),
        amountBps: 5000,
      },
      {
        input: new core.tokens.TokenAmount(underlyingTokens.USDC, '1'),
        output: new core.tokens.TokenAmount(cTokens.cUSDC),
        amountBps: 5000,
      },
    ];

    cases.forEach(({ input, output, amountBps }) => {
      it(`${input.token.symbol} to ${output.token.symbol}${amountBps ? ' with amountBps' : ''}`, async function () {
        const logic = await compoundV2Supply.getLogic({ input, output, amountBps });
        const sig = logic.data.substring(0, 10);

        expect(logic.to).to.eq(output.token.address);
        expect(utils.isBytesLike(logic.data)).to.be.true;
        if (input.token.isNative()) {
          expect(sig).to.eq(cEther.getSighash('mint'));
          expect(logic.inputs[0].token).to.eq(core.tokens.ELASTIC_ADDRESS);
        } else {
          expect(sig).to.eq(cErc20.getSighash('mint'));
        }
        if (amountBps) {
          expect(logic.inputs[0].amountBps).to.eq(amountBps);
          expect(logic.inputs[0].amountOrOffset).to.eq(input.token.isNative() ? constants.MaxUint256 : 0);
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

import { AaveV2DepositLogic } from './logic.deposit';
import { LendingPool__factory } from './contracts';
import { constants, utils } from 'ethers';
import * as core from 'src/core';
import { expect } from 'chai';
import { mainnet } from './tokens/data';
import * as rt from 'src/router';

describe('AaveV2DepositLogic', function () {
  const chainId = core.network.ChainId.mainnet;
  const aavev2DepositLogic = new AaveV2DepositLogic({ chainId });

  context('Test getLogic', function () {
    const lendingPoolIface = LendingPool__factory.createInterface();

    const cases = [
      {
        input: new core.tokens.TokenAmount(mainnet.WETH, '1'),
        output: new core.tokens.TokenAmount(mainnet.aWETH, '1'),
      },
      {
        input: new core.tokens.TokenAmount(mainnet.USDC, '1'),
        output: new core.tokens.TokenAmount(mainnet.aUSDC, '1'),
      },
      {
        input: new core.tokens.TokenAmount(mainnet.WETH, '1'),
        output: new core.tokens.TokenAmount(mainnet.aWETH, '1'),
        amountBps: 5000,
      },
      {
        input: new core.tokens.TokenAmount(mainnet.USDC, '1'),
        output: new core.tokens.TokenAmount(mainnet.aUSDC, '1'),
        amountBps: 5000,
      },
    ];

    cases.forEach(({ input, output, amountBps }) => {
      it(`deposit ${input.token.symbol}${amountBps ? ' with amountBps' : ''}`, async function () {
        const logic = await aavev2DepositLogic.getLogic({
          routerAddress: rt.config.getContractAddress(chainId, 'Router'),
          input,
          output,
          amountBps,
        });
        const sig = logic.data.substring(0, 10);

        expect(utils.isBytesLike(logic.data)).to.be.true;
        const lendingPoolAddress = await aavev2DepositLogic.service.getLendingPoolAddress();
        expect(logic.to).to.eq(lendingPoolAddress);
        expect(sig).to.eq(lendingPoolIface.getSighash('deposit'));
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

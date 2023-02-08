import { AaveV2RepayLogic } from './logic.repay';
import { InterestRateMode } from './types';
import { LendingPool__factory, WETHGateway__factory } from './contracts';
import { constants, utils } from 'ethers';
import * as core from 'src/core';
import { expect } from 'chai';
import { mainnet } from './tokens/data';

describe('AaveV2RepayLogic', function () {
  const chainId = core.network.ChainId.mainnet;
  const aavev2RepayLogic = new AaveV2RepayLogic({ chainId });

  context('Test getLogic', function () {
    const lendingPoolIface = LendingPool__factory.createInterface();
    const wethGatewayIface = WETHGateway__factory.createInterface();

    const cases = [
      {
        account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        input: new core.tokens.TokenAmount(core.tokens.mainnet.ETH, '1'),
        interestRateMode: InterestRateMode.variable,
      },
      {
        account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        input: new core.tokens.TokenAmount(mainnet.WETH, '1'),
        interestRateMode: InterestRateMode.variable,
      },
      {
        account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        input: new core.tokens.TokenAmount(mainnet.USDC, '1'),
        interestRateMode: InterestRateMode.variable,
      },
    ];

    cases.forEach(({ account, input, interestRateMode }) => {
      it(`repay ${input.token.symbol}`, async function () {
        const logic = await aavev2RepayLogic.getLogic({ account, input, interestRateMode });
        const sig = logic.data.substring(0, 10);

        expect(utils.isBytesLike(logic.data)).to.be.true;
        if (input.token.isNative()) {
          const wethGatewayAddress = await aavev2RepayLogic.service.getWETHGatewayAddress();
          expect(logic.to).to.eq(wethGatewayAddress);
          expect(sig).to.eq(wethGatewayIface.getSighash('repayETH'));
          expect(logic.inputs[0].token).to.eq(core.tokens.ELASTIC_ADDRESS);
          expect(logic.inputs[0].doApprove).to.be.false;
        } else {
          const lendingPoolAddress = await aavev2RepayLogic.service.getLendingPoolAddress();
          expect(logic.to).to.eq(lendingPoolAddress);
          expect(sig).to.eq(lendingPoolIface.getSighash('repay'));
          expect(logic.inputs[0].doApprove).to.be.true;
        }
        expect(logic.inputs[0].amountBps).to.eq(constants.MaxUint256);
        expect(logic.inputs[0].amountOrOffset).eq(input.amountWei);
        expect(logic.outputs).to.deep.eq([]);
        expect(logic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

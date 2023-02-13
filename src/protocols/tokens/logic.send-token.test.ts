import { SendTokenLogic } from './logic.send-token';
import { constants, utils } from 'ethers';
import * as core from 'src/core';
import { expect } from 'chai';

describe('SendTokenLogic', function () {
  const chainId = core.network.ChainId.mainnet;
  const sendToken = new SendTokenLogic({ chainId });

  context('Test getLogic', function () {
    const iface = core.contracts.ERC20__factory.createInterface();

    const cases = [
      {
        input: new core.tokens.TokenAmount(core.tokens.mainnet.WETH, '1'),
        recipient: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
      },
      {
        input: new core.tokens.TokenAmount(core.tokens.mainnet.USDC, '1'),
        recipient: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
      },
      {
        input: new core.tokens.TokenAmount(core.tokens.mainnet.WETH, '1'),
        recipient: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        amountBps: 5000,
      },
      {
        input: new core.tokens.TokenAmount(core.tokens.mainnet.USDC, '1'),
        recipient: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        amountBps: 5000,
      },
    ];

    cases.forEach(({ input, recipient, amountBps }) => {
      it(`${input.token.symbol} to ${recipient}${amountBps ? ' with amountBps' : ''}`, async function () {
        const logic = await sendToken.getLogic({ input, recipient, amountBps });
        const sig = logic.data.substring(0, 10);

        expect(logic.to).to.eq(input.token.address);
        expect(utils.isBytesLike(logic.data)).to.be.true;
        expect(sig).to.eq(iface.getSighash('transfer'));
        if (amountBps) {
          expect(logic.inputs[0].amountBps).to.eq(amountBps);
          expect(logic.inputs[0].amountOrOffset).to.eq(32);
        } else {
          expect(logic.inputs).to.deep.eq([]);
        }
        expect(logic.outputs).to.deep.eq([]);
        expect(logic.approveTo).to.eq(constants.AddressZero);
        expect(logic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

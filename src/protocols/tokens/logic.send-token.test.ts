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
    ];

    cases.forEach(({ input, recipient }) => {
      it(`${input.token.symbol} to ${recipient}`, async function () {
        const logic = await sendToken.getLogic({ input, recipient });
        const sig = logic.data.substring(0, 10);

        expect(logic.to).to.eq(input.token.address);
        expect(utils.isBytesLike(logic.data)).to.be.true;
        expect(sig).to.eq(iface.getSighash('transfer'));
        expect(logic.inputs).to.deep.eq([]);
        expect(logic.outputs).to.deep.eq([]);
        expect(logic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

import { RouterDepositLogic } from './logic.deposit';
import { constants, utils } from 'ethers';
import * as core from 'src/core';
import { expect } from 'chai';
import * as rt from 'src/router';

describe('RouterDepositLogic', function () {
  const chainId = 1;
  const routerDeposit = new RouterDepositLogic({ chainId });

  context('Test getLogic', function () {
    const iface = rt.contracts.SpenderERC20Approval__factory.createInterface();

    const cases = [
      { funds: new core.tokens.TokenAmounts([core.tokens.mainnet.ETH, '1'], [core.tokens.mainnet.USDC, '1']) },
      { funds: new core.tokens.TokenAmounts([core.tokens.mainnet.WETH, '1'], [core.tokens.mainnet.USDC, '1']) },
    ];

    cases.forEach(({ funds }, i) => {
      it(`case ${i + 1}`, async function () {
        const erc20Funds = funds.erc20;
        const logic = await routerDeposit.getLogic({ funds: erc20Funds });
        const sig = logic.data.substring(0, 10);

        if (erc20Funds.length == 1) {
          expect(sig).to.eq(iface.getSighash('pullToken'));
        } else {
          expect(sig).to.eq(iface.getSighash('pullTokens'));
        }
        expect(logic.to).to.eq(routerDeposit.routerConfig.erc20Spender);
        expect(utils.isBytesLike(logic.data)).to.be.true;
        expect(logic.inputs).to.deep.eq([]);
        expect(logic.outputs).to.deep.eq([]);
        expect(logic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

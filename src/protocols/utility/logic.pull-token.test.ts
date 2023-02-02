import { ETH_MAINNET, TokenAmount, TokenAmounts, USDC_MAINNET, WETH_MAINNET } from 'src/core';
import { PullTokenLogic } from './logic.pull-token';
import { SpenderERC20Approval__factory } from './contracts';
import { constants, utils } from 'ethers';
import { expect } from 'chai';

describe('PullTokenLogic', () => {
  describe('Test getLogic', () => {
    const chainId = 1;
    const logic = new PullTokenLogic({ chainId });
    const iface = SpenderERC20Approval__factory.createInterface();

    const cases = [
      { funds: new TokenAmounts([new TokenAmount(ETH_MAINNET, '1'), new TokenAmount(USDC_MAINNET, '1')]) },
      { funds: new TokenAmounts([new TokenAmount(WETH_MAINNET, '1'), new TokenAmount(USDC_MAINNET, '1')]) },
    ];

    cases.forEach(({ funds }, i) => {
      it(`case ${i + 1}`, async function () {
        const routerLogic = await logic.getLogic({ funds });
        const sig = routerLogic.data.substring(0, 10);

        if (funds.filter((fund) => !fund.token.isNative()).length == 1) {
          expect(sig).to.eq(iface.getSighash('pullToken'));
        } else {
          expect(sig).to.eq(iface.getSighash('pullTokens'));
        }
        expect(routerLogic.to).to.eq(logic.routerConfig.erc20Spender);
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        expect(routerLogic.inputs).to.deep.eq([]);
        expect(routerLogic.outputs).to.deep.eq([]);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

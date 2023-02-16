/* eslint-disable max-len */

import { RouterPullTokenLogic } from './logic.pull-token';
import { SpenderPermit2ERC20__factory } from './contracts';
import { constants, utils } from 'ethers';
import * as core from 'src/core';
import { expect } from 'chai';
import { getContractAddress } from './config';

describe('RouterPullTokenLogic', function () {
  const chainId = core.network.ChainId.mainnet;
  const routerPullToken = new RouterPullTokenLogic({ chainId });

  context('Test getLogic', function () {
    const account = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';
    const routerAddress = '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB';
    const iface = SpenderPermit2ERC20__factory.createInterface();

    const cases = [
      { funds: new core.tokens.TokenAmounts([core.tokens.mainnet.ETH, '1'], [core.tokens.mainnet.WETH, '1']) },
      { funds: new core.tokens.TokenAmounts([core.tokens.mainnet.WETH, '1'], [core.tokens.mainnet.USDC, '1']) },
    ];

    cases.forEach(({ funds }, i) => {
      it(`case ${i + 1}`, async function () {
        const erc20Funds = funds.erc20;
        const logic = await routerPullToken.getLogic({ account, routerAddress, erc20Funds });
        const sig = logic.data.substring(0, 10);

        expect(logic.to).to.eq(getContractAddress(chainId, 'SpenderPermit2ERC20'));
        expect(utils.isBytesLike(logic.data)).to.be.true;
        if (erc20Funds.length == 1) {
          expect(sig).to.eq(iface.getSighash('pullToken'));
        } else {
          expect(sig).to.eq(iface.getSighash('pullTokens'));
        }
        expect(logic.inputs).to.deep.eq([]);
        expect(logic.outputs).to.deep.eq([]);
        expect(logic.approveTo).to.eq(constants.AddressZero);
        expect(logic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

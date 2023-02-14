/* eslint-disable max-len */

import { Permit2__factory } from './contracts';
import { RouterPermitTokenLogic } from './logic.permit-token';
import { constants, utils } from 'ethers';
import * as core from 'src/core';
import { expect } from 'chai';
import { getContractAddress } from './config';

describe('RouterPermitTokenLogic', function () {
  const chainId = core.network.ChainId.mainnet;
  const routerPermitToken = new RouterPermitTokenLogic({ chainId });

  context('Test getLogic', function () {
    const account = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';
    const spender = '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB';
    const permitSig =
      '0xbb8d0cf3e494c2ed4dc1057ee31c90cab5387b8a606019cc32a6d12f714303df183b1b0cd7a1114bd952a4c533ac18606056dda61f922e030967df0836cf76f91c';
    const iface = Permit2__factory.createInterface();

    const cases = [
      { erc20Funds: new core.tokens.TokenAmounts([core.tokens.mainnet.WETH, '1'], [core.tokens.mainnet.USDC, '1']) },
      { erc20Funds: new core.tokens.TokenAmounts([core.tokens.mainnet.DAI, '1'], [core.tokens.mainnet.USDT, '1']) },
    ];

    cases.forEach(({ erc20Funds }, i) => {
      it(`case ${i + 1}`, async function () {
        const permitDetails = await routerPermitToken.getPermitDetails(account, erc20Funds, spender);
        expect(permitDetails.length).to.eq(erc20Funds.length);
        const permit = routerPermitToken.getPermit(permitDetails, spender);
        const logic = await routerPermitToken.getLogic({ account, permit, sig: permitSig });
        const sig = logic.data.substring(0, 10);

        expect(logic.to).to.eq(getContractAddress(chainId, 'Permit2'));
        expect(sig).to.eq(
          iface.getSighash('permit(address,((address,uint160,uint48,uint48)[],address,uint256),bytes)')
        );
        expect(utils.isBytesLike(logic.data)).to.be.true;
        expect(logic.inputs).to.deep.eq([]);
        expect(logic.outputs).to.deep.eq([]);
        expect(logic.approveTo).to.eq(constants.AddressZero);
        expect(logic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

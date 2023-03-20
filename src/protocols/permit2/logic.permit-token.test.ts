import { Permit2__factory } from './contracts';
import { PermitTokenLogic } from './logic.permit-token';
import * as common from '@composable-router/common';
import { constants, utils } from 'ethers';
import { expect } from 'chai';
import { getContractAddress } from './config';
import { mainnetTokens } from '@composable-router/test-helpers';

describe('Permit2 PermitTokenLogic', function () {
  const chainId = common.ChainId.mainnet;
  const routerPermitTokenLogic = new PermitTokenLogic(chainId);

  context('Test getLogic', function () {
    const account = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';
    const permitSig =
      '0xbb8d0cf3e494c2ed4dc1057ee31c90cab5387b8a606019cc32a6d12f714303df183b1b0cd7a1114bd952a4c533ac18606056dda61f922e030967df0836cf76f91c';
    const iface = Permit2__factory.createInterface();

    const testCases = [
      { erc20Funds: new common.TokenAmounts([mainnetTokens.WETH, '1'], [mainnetTokens.USDC, '1']) },
      { erc20Funds: new common.TokenAmounts([mainnetTokens.DAI, '1'], [mainnetTokens.USDT, '1']) },
    ];

    testCases.forEach(({ erc20Funds }, i) => {
      it(`case ${i + 1}`, async function () {
        const permitData = await routerPermitTokenLogic.getPermitData(account, erc20Funds);
        const routerLogic = await routerPermitTokenLogic.getLogic(
          { permit: permitData!.values, sig: permitSig },
          { account }
        );
        const sig = routerLogic.data.substring(0, 10);

        expect(routerLogic.to).to.eq(getContractAddress(chainId, 'Permit2'));
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        expect(sig).to.eq(
          iface.getSighash(
            erc20Funds.length === 1
              ? 'permit(address,((address,uint160,uint48,uint48),address,uint256),bytes)'
              : 'permit(address,((address,uint160,uint48,uint48)[],address,uint256),bytes)'
          )
        );
        expect(routerLogic.inputs).to.deep.eq([]);
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

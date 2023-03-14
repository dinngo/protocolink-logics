import { LogicTestCase } from 'test/types';
import { PullTokenLogic, PullTokenLogicFields } from './logic.pull-token';
import { SpenderPermit2ERC20__factory } from './contracts';
import * as common from '@composable-router/common';
import { constants, utils } from 'ethers';
import { expect } from 'chai';
import { getContractAddress } from './config';
import { mainnetTokens } from '@composable-router/test-helpers';

describe('Router PullTokenLogic', function () {
  const chainId = common.ChainId.mainnet;
  const routerPullTokenLogic = new PullTokenLogic(chainId);

  context('Test getLogic', function () {
    const account = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';
    const iface = SpenderPermit2ERC20__factory.createInterface();

    const testCases: LogicTestCase<PullTokenLogicFields>[] = [
      { fields: { inputs: new common.TokenAmounts([mainnetTokens.WETH, '1']) } },
      { fields: { inputs: new common.TokenAmounts([mainnetTokens.WETH, '1'], [mainnetTokens.USDC, '1']) } },
    ];

    testCases.forEach(({ fields }, i) => {
      it(`case ${i + 1}`, async function () {
        const routerLogic = await routerPullTokenLogic.getLogic(fields, { account });
        const sig = routerLogic.data.substring(0, 10);
        const { inputs } = fields;

        expect(routerLogic.to).to.eq(getContractAddress(chainId, 'SpenderPermit2ERC20'));
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        if (inputs.length == 1) {
          expect(sig).to.eq(iface.getSighash('pullToken'));
        } else {
          expect(sig).to.eq(iface.getSighash('pullTokens'));
        }
        expect(routerLogic.inputs).to.deep.eq([]);
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

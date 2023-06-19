import { LogicTestCase } from 'test/types';
import { Permit2__factory } from './contracts';
import { PullTokenLogic, PullTokenLogicFields } from './logic.pull-token';
import * as common from '@furucombo/composable-router-common';
import { constants, utils } from 'ethers';
import { expect } from 'chai';
import { getContractAddress } from './config';
import { mainnetTokens } from '@furucombo/composable-router-test-helpers';

describe('Permit2 PullTokenLogic', function () {
  const chainId = common.ChainId.mainnet;
  const logic = new PullTokenLogic(chainId);

  context('Test build', function () {
    const account = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';
    const iface = Permit2__factory.createInterface();

    const testCases: LogicTestCase<PullTokenLogicFields>[] = [
      { fields: { inputs: new common.TokenAmounts([mainnetTokens.WETH, '1']) } },
      { fields: { inputs: new common.TokenAmounts([mainnetTokens.WETH, '1'], [mainnetTokens.USDC, '1']) } },
    ];

    testCases.forEach(({ fields }, i) => {
      it(`case ${i + 1}`, async function () {
        const routerLogic = await logic.build(fields, { account });
        const sig = routerLogic.data.substring(0, 10);
        const { inputs } = fields;

        expect(routerLogic.to).to.eq(getContractAddress(chainId, 'Permit2'));
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        expect(sig).to.eq(
          iface.getSighash(
            inputs.length == 1
              ? 'transferFrom(address,address,uint160,address)'
              : 'transferFrom((address,address,uint160,address)[])'
          )
        );
        expect(routerLogic.inputs).to.deep.eq([]);
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

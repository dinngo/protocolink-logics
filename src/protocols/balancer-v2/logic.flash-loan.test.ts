import { FlashLoanLogic, FlashLoanLogicFields } from './logic.flash-loan';
import { LogicTestCase } from 'test/types';
import { Vault__factory } from './contracts';
import * as common from '@composable-router/common';
import { constants, utils } from 'ethers';
import { expect } from 'chai';
import { getContractAddress } from './config';
import { mainnetTokens } from '@composable-router/test-helpers';

describe('BalancerV2 FlashLoanLogic', function () {
  const chainId = common.ChainId.mainnet;
  const balancerV2FlashLoanLogic = new FlashLoanLogic(chainId);

  context('Test getLogic', function () {
    const vaultIface = Vault__factory.createInterface();

    const testCases: LogicTestCase<FlashLoanLogicFields>[] = [
      {
        fields: {
          outputs: new common.TokenAmounts([mainnetTokens.WETH, '1'], [mainnetTokens.USDC, '1']),
          params: '0x',
        },
      },
    ];

    testCases.forEach(({ fields }) => {
      it(`flash loan ${fields.outputs.map((output) => output.token.symbol).join(',')}`, async function () {
        const routerLogic = await balancerV2FlashLoanLogic.getLogic(fields);
        const sig = routerLogic.data.substring(0, 10);

        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        expect(routerLogic.to).to.eq(getContractAddress(chainId, 'Vault'));
        expect(sig).to.eq(vaultIface.getSighash('flashLoan'));
        expect(routerLogic.inputs).to.deep.eq([]);
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(getContractAddress(chainId, 'FlashLoanCallbackBalancerV2'));
      });
    });
  });
});

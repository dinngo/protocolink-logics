import { FlashLoanLogic, FlashLoanLogicFields } from './logic.flash-loan';
import { LendingPool__factory } from './contracts';
import { LogicTestCase } from 'test/types';
import { Service } from './service';
import * as common from '@composable-router/common';
import { constants, utils } from 'ethers';
import { expect } from 'chai';
import { getContractAddress } from './config';
import { mainnetTokens } from './tokens';

describe('AaveV2 FlashLoanLogic', function () {
  const chainId = common.ChainId.mainnet;
  const aaveV2FlashLoanLogic = new FlashLoanLogic(chainId);
  let lendingPoolAddress: string;

  before(async function () {
    const service = new Service(chainId);
    lendingPoolAddress = await service.getLendingPoolAddress();
  });

  context('Test getLogic', function () {
    const lendingPoolIface = LendingPool__factory.createInterface();

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
        const routerLogic = await aaveV2FlashLoanLogic.getLogic(fields);
        const sig = routerLogic.data.substring(0, 10);

        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        expect(routerLogic.to).to.eq(lendingPoolAddress);
        expect(sig).to.eq(lendingPoolIface.getSighash('flashLoan'));
        expect(routerLogic.inputs).to.deep.eq([]);
        expect(routerLogic.outputs).to.deep.eq([]);
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(getContractAddress(chainId, 'FlashLoanCallbackAaveV2'));
      });
    });
  });
});

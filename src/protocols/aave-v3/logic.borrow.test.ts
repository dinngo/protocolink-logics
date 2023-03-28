import { BorrowLogic, BorrowLogicFields } from './logic.borrow';
import { InterestRateMode } from './types';
import { Pool__factory } from './contracts';
import { LogicTestCase } from 'test/types';
import { Service } from './service';
import * as common from '@composable-router/common';
import { constants, utils } from 'ethers';
import { expect } from 'chai';
import { mainnetTokens } from './tokens';

describe('AaveV3 BorrowLogic', function () {
  context('Test getTokenList', async function () {
    BorrowLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.getNetworkId(chainId)}`, async function () {
        const borrowLogic = new BorrowLogic(chainId);
        const tokens = await borrowLogic.getTokenList();
        expect(tokens.length).to.be.gt(0);
      });
    });
  });

  context('Test getLogic', function () {
    const chainId = common.ChainId.mainnet;
    const aaveV3BorrowLogic = new BorrowLogic(chainId);
    let poolAddress: string;
    const poolIface = Pool__factory.createInterface();
    const account = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';

    before(async function () {
      const service = new Service(chainId);
      poolAddress = await service.getPoolAddress();
    });

    const testCases: LogicTestCase<BorrowLogicFields>[] = [
      {
        fields: {
          output: new common.TokenAmount(mainnetTokens.WETH, '1'),
          interestRateMode: InterestRateMode.variable,
        },
      },
      {
        fields: {
          output: new common.TokenAmount(mainnetTokens.USDC, '1'),
          interestRateMode: InterestRateMode.variable,
        },
      },
    ];

    testCases.forEach(({ fields }) => {
      it(`borrow ${fields.output.token.symbol}`, async function () {
        const routerLogic = await aaveV3BorrowLogic.getLogic(fields, { account });
        const sig = routerLogic.data.substring(0, 10);

        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        expect(routerLogic.to).to.eq(poolAddress);
        expect(sig).to.eq(poolIface.getSighash('borrow'));
        expect(routerLogic.inputs).to.deep.eq([]);
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

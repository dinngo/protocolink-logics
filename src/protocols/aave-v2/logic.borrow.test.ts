import { BorrowLogic, BorrowLogicFields } from './logic.borrow';
import { InterestRateMode } from './types';
import { LendingPool__factory } from './contracts';
import { LogicTestCase } from 'test/types';
import { Service } from './service';
import * as common from '@composable-router/common';
import { constants, utils } from 'ethers';
import * as core from '@composable-router/core';
import { expect } from 'chai';
import { mainnetTokens } from './tokens';

describe('AaveV2 BorrowLogic', function () {
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
    const aaveV2BorrowLogic = new BorrowLogic(chainId);
    let lendingPoolAddress: string;
    const lendingPoolIface = LendingPool__factory.createInterface();
    const account = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';

    before(async function () {
      const service = new Service(chainId);
      lendingPoolAddress = await service.getLendingPoolAddress();
    });

    const testCases: LogicTestCase<BorrowLogicFields>[] = [
      {
        fields: {
          output: new common.TokenAmount(mainnetTokens.ETH, '1'),
          interestRateMode: InterestRateMode.variable,
        },
      },
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
        const routerLogic = await aaveV2BorrowLogic.getLogic(fields, { account });
        const sig = routerLogic.data.substring(0, 10);
        const { output } = fields;

        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        expect(routerLogic.to).to.eq(lendingPoolAddress);
        expect(sig).to.eq(lendingPoolIface.getSighash('borrow'));
        expect(routerLogic.inputs).to.deep.eq([]);
        expect(routerLogic.wrapMode).to.eq(output.token.isNative ? core.WrapMode.unwrapAfter : core.WrapMode.none);
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

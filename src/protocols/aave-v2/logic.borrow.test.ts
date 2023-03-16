import { BorrowLogic, BorrowLogicFields } from './logic.borrow';
import { InterestRateMode } from './types';
import { LogicTestCase } from 'test/types';
import { SpenderAaveV2Delegation__factory } from './contracts';
import * as common from '@composable-router/common';
import { constants, utils } from 'ethers';
import { expect } from 'chai';
import { getContractAddress } from './config';
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
    const spenderAaveV2Delegation = SpenderAaveV2Delegation__factory.createInterface();

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
        const routerLogic = await aaveV2BorrowLogic.getLogic(fields);
        const sig = routerLogic.data.substring(0, 10);
        const { output } = fields;

        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        expect(routerLogic.to).to.eq(getContractAddress(chainId, 'SpenderAaveV2Delegation'));
        expect(sig).to.eq(spenderAaveV2Delegation.getSighash(output.token.isNative ? 'borrowETH' : 'borrow'));
        expect(routerLogic.inputs).to.deep.eq([]);
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

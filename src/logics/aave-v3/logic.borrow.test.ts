import { BorrowLogic, BorrowLogicFields } from './logic.borrow';
import { InterestRateMode } from './types';
import { LogicTestCase } from 'test/types';
import { Pool__factory } from './contracts';
import { Service } from './service';
import * as common from '@protocolink/common';
import { constants, utils } from 'ethers';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import { mainnetTokens } from './tokens';

describe('AaveV3 BorrowLogic', function () {
  context('Test getTokenList', async function () {
    BorrowLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.toNetworkId(chainId)}`, async function () {
        const logic = new BorrowLogic(chainId);
        const tokenList = await logic.getTokenList();
        expect(tokenList).to.have.lengthOf.above(0);
      });
    });
  });

  context('Test build', function () {
    const chainId = common.ChainId.mainnet;
    const logic = new BorrowLogic(chainId);
    let poolAddress: string;
    const iface = Pool__factory.createInterface();
    const account = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';

    before(async function () {
      const service = new Service(chainId);
      poolAddress = await service.getPoolAddress();
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
        const routerLogic = await logic.build(fields, { account });
        const sig = routerLogic.data.substring(0, 10);
        const { output } = fields;

        expect(routerLogic.to).to.eq(poolAddress);
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        expect(sig).to.eq(iface.getSighash('borrow'));
        expect(routerLogic.inputs).to.deep.eq([]);
        expect(routerLogic.wrapMode).to.eq(output.token.isNative ? core.WrapMode.unwrapAfter : core.WrapMode.none);
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

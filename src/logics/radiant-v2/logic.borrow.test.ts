import { BorrowLogic, BorrowLogicFields } from './logic.borrow';
import { InterestRateMode } from './types';
import { LendingPool__factory } from './contracts';
import { LogicTestCase } from 'test/types';
import { Service } from './service';
import { arbitrumTokens, mainnetTokens } from './tokens';
import * as common from '@protocolink/common';
import { constants, utils } from 'ethers';
import * as core from '@protocolink/core';
import { expect } from 'chai';

describe('RadiantV2 BorrowLogic', () => {
  context('Test getTokenList', async () => {
    BorrowLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.toNetworkId(chainId)}`, async () => {
        const logic = new BorrowLogic(chainId);
        const tokenList = await logic.getTokenList();
        expect(tokenList).to.have.lengthOf.above(0);
      });
    });
  });

  context('Test build', () => {
    const chainId = common.ChainId.mainnet;
    const logic = new BorrowLogic(chainId);
    let lendingPoolAddress: string;
    const iface = LendingPool__factory.createInterface();
    const account = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';

    before(async () => {
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
      it(`borrow ${fields.output.token.symbol}`, async () => {
        const routerLogic = await logic.build(fields, { account });
        const sig = routerLogic.data.substring(0, 10);
        const { output } = fields;

        expect(routerLogic.to).to.eq(lendingPoolAddress);
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        expect(sig).to.eq(iface.getSighash('borrow'));
        expect(routerLogic.inputs).to.deep.eq([]);
        expect(routerLogic.wrapMode).to.eq(output.token.isNative ? core.WrapMode.unwrapAfter : core.WrapMode.none);
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });

  context('Test build - Arbitrum', () => {
    const chainId = common.ChainId.arbitrum;
    const logic = new BorrowLogic(chainId);
    let lendingPoolAddress: string;
    const iface = LendingPool__factory.createInterface();
    const account = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';

    before(async () => {
      const service = new Service(chainId);
      lendingPoolAddress = await service.getLendingPoolAddress();
    });

    const testCases: LogicTestCase<BorrowLogicFields>[] = [
      {
        fields: {
          output: new common.TokenAmount(arbitrumTokens.ETH, '1'),
          interestRateMode: InterestRateMode.variable,
        },
      },
      {
        fields: {
          output: new common.TokenAmount(arbitrumTokens.WETH, '1'),
          interestRateMode: InterestRateMode.variable,
        },
      },
      {
        fields: {
          output: new common.TokenAmount(arbitrumTokens.USDC, '1'),
          interestRateMode: InterestRateMode.variable,
        },
      },
    ];

    testCases.forEach(({ fields }) => {
      it(`borrow ${fields.output.token.symbol}`, async () => {
        const routerLogic = await logic.build(fields, { account });
        const sig = routerLogic.data.substring(0, 10);
        const { output } = fields;

        expect(routerLogic.to).to.eq(lendingPoolAddress);
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

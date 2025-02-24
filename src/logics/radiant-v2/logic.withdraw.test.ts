import { LendingPool__factory } from './contracts';
import { LogicTestCase } from 'test/types';
import { Service } from './service';
import { WithdrawLogic, WithdrawLogicFields } from './logic.withdraw';
import { arbitrumTokens, mainnetTokens } from './tokens';
import * as common from '@protocolink/common';
import { constants, utils } from 'ethers';
import * as core from '@protocolink/core';
import { expect } from 'chai';

describe('RadiantV2 WithdrawLogic', () => {
  context('Test getTokenList', async () => {
    WithdrawLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.toNetworkId(chainId)}`, async () => {
        const logic = new WithdrawLogic(chainId);
        const tokenList = await logic.getTokenList();
        expect(tokenList).to.have.lengthOf.above(0);
      });
    });
  });

  context('Test build', () => {
    const chainId = common.ChainId.mainnet;
    const logic = new WithdrawLogic(chainId);
    let lendingPoolAddress: string;
    const iface = LendingPool__factory.createInterface();
    const account = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';

    before(async () => {
      const service = new Service(chainId);
      lendingPoolAddress = await service.getLendingPoolAddress();
    });

    const testCases: LogicTestCase<WithdrawLogicFields>[] = [
      {
        fields: {
          input: new common.TokenAmount(mainnetTokens.rWETH, '1'),
          output: new common.TokenAmount(mainnetTokens.ETH, '1'),
        },
      },
      {
        fields: {
          input: new common.TokenAmount(mainnetTokens.rWETH, '1'),
          output: new common.TokenAmount(mainnetTokens.WETH, '1'),
        },
      },
      {
        fields: {
          input: new common.TokenAmount(mainnetTokens.rUSDC, '1'),
          output: new common.TokenAmount(mainnetTokens.USDC, '1'),
        },
      },
      {
        fields: {
          input: new common.TokenAmount(mainnetTokens.rWETH, '1'),
          output: new common.TokenAmount(mainnetTokens.ETH, '1'),
          balanceBps: 5000,
        },
      },
      {
        fields: {
          input: new common.TokenAmount(mainnetTokens.rWETH, '1'),
          output: new common.TokenAmount(mainnetTokens.WETH, '1'),
          balanceBps: 5000,
        },
      },
      {
        fields: {
          input: new common.TokenAmount(mainnetTokens.rUSDC, '1'),
          output: new common.TokenAmount(mainnetTokens.USDC, '1'),
          balanceBps: 5000,
        },
      },
    ];

    testCases.forEach(({ fields }) => {
      it(`withdraw ${fields.output.token.symbol}${fields.balanceBps ? ' with balanceBps' : ''}`, async () => {
        const routerLogic = await logic.build(fields, { account });
        const sig = routerLogic.data.substring(0, 10);
        const { input, output, balanceBps } = fields;

        expect(routerLogic.to).to.eq(lendingPoolAddress);
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        expect(sig).to.eq(iface.getSighash('withdraw'));
        expect(routerLogic.inputs[0].token).to.eq(input.token.address);
        if (balanceBps) {
          expect(routerLogic.inputs[0].balanceBps).to.eq(balanceBps);
          expect(routerLogic.inputs[0].amountOrOffset).to.eq(common.getParamOffset(1));
        } else {
          expect(routerLogic.inputs[0].balanceBps).to.eq(core.BPS_NOT_USED);
          expect(routerLogic.inputs[0].amountOrOffset).eq(input.amountWei);
        }
        expect(routerLogic.wrapMode).to.eq(output.token.isNative ? core.WrapMode.unwrapAfter : core.WrapMode.none);
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });

  context('Test build - Arbitrum', () => {
    const chainId = common.ChainId.arbitrum;
    const logic = new WithdrawLogic(chainId);
    let lendingPoolAddress: string;
    const iface = LendingPool__factory.createInterface();
    const account = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';

    before(async () => {
      const service = new Service(chainId);
      lendingPoolAddress = await service.getLendingPoolAddress();
    });

    const testCases: LogicTestCase<WithdrawLogicFields>[] = [
      {
        fields: {
          input: new common.TokenAmount(arbitrumTokens.rWETH, '1'),
          output: new common.TokenAmount(arbitrumTokens.ETH, '1'),
        },
      },
      {
        fields: {
          input: new common.TokenAmount(arbitrumTokens.rWETH, '1'),
          output: new common.TokenAmount(arbitrumTokens.WETH, '1'),
        },
      },
      {
        fields: {
          input: new common.TokenAmount(arbitrumTokens.rUSDC, '1'),
          output: new common.TokenAmount(arbitrumTokens.USDC, '1'),
        },
      },
      {
        fields: {
          input: new common.TokenAmount(arbitrumTokens.rWETH, '1'),
          output: new common.TokenAmount(arbitrumTokens.ETH, '1'),
          balanceBps: 5000,
        },
      },
      {
        fields: {
          input: new common.TokenAmount(arbitrumTokens.rWETH, '1'),
          output: new common.TokenAmount(arbitrumTokens.WETH, '1'),
          balanceBps: 5000,
        },
      },
      {
        fields: {
          input: new common.TokenAmount(arbitrumTokens.rUSDC, '1'),
          output: new common.TokenAmount(arbitrumTokens.USDC, '1'),
          balanceBps: 5000,
        },
      },
    ];

    testCases.forEach(({ fields }) => {
      it(`withdraw ${fields.output.token.symbol}${fields.balanceBps ? ' with balanceBps' : ''}`, async () => {
        const routerLogic = await logic.build(fields, { account });
        const sig = routerLogic.data.substring(0, 10);
        const { input, output, balanceBps } = fields;

        expect(routerLogic.to).to.eq(lendingPoolAddress);
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        expect(sig).to.eq(iface.getSighash('withdraw'));
        expect(routerLogic.inputs[0].token).to.eq(input.token.address);
        if (balanceBps) {
          expect(routerLogic.inputs[0].balanceBps).to.eq(balanceBps);
          expect(routerLogic.inputs[0].amountOrOffset).to.eq(common.getParamOffset(1));
        } else {
          expect(routerLogic.inputs[0].balanceBps).to.eq(core.BPS_NOT_USED);
          expect(routerLogic.inputs[0].amountOrOffset).eq(input.amountWei);
        }
        expect(routerLogic.wrapMode).to.eq(output.token.isNative ? core.WrapMode.unwrapAfter : core.WrapMode.none);
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

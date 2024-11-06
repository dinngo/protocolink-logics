import { DepositLogic, DepositLogicFields } from './logic.deposit';
import { LendingPool__factory } from './contracts';
import { LogicTestCase } from 'test/types';
import { Service } from './service';
import * as common from '@protocolink/common';
import { constants, utils } from 'ethers';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import { mainnetTokens } from './tokens';

describe('RadiantV2 DepositLogic', () => {
  context('Test getTokenList', async () => {
    DepositLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.toNetworkId(chainId)}`, async () => {
        const logic = new DepositLogic(chainId);
        const tokenList = await logic.getTokenList();
        expect(tokenList).to.have.lengthOf.above(0);
      });
    });
  });

  context('Test build', () => {
    const chainId = common.ChainId.mainnet;
    const logic = new DepositLogic(chainId);
    let lendingPoolAddress: string;
    const iface = LendingPool__factory.createInterface();
    const account = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';

    before(async () => {
      const service = new Service(chainId);
      lendingPoolAddress = await service.getLendingPoolAddress();
    });

    const testCases: LogicTestCase<DepositLogicFields>[] = [
      {
        fields: {
          input: new common.TokenAmount(mainnetTokens.ETH, '1'),
          output: new common.TokenAmount(mainnetTokens.rWETH, '1'),
        },
      },
      {
        fields: {
          input: new common.TokenAmount(mainnetTokens.WETH, '1'),
          output: new common.TokenAmount(mainnetTokens.rWETH, '1'),
        },
      },
      {
        fields: {
          input: new common.TokenAmount(mainnetTokens.USDC, '1'),
          output: new common.TokenAmount(mainnetTokens.rUSDC, '1'),
        },
      },
      {
        fields: {
          input: new common.TokenAmount(mainnetTokens.ETH, '1'),
          output: new common.TokenAmount(mainnetTokens.rWETH, '1'),
          balanceBps: 5000,
        },
      },
      {
        fields: {
          input: new common.TokenAmount(mainnetTokens.WETH, '1'),
          output: new common.TokenAmount(mainnetTokens.rWETH, '1'),
          balanceBps: 5000,
        },
      },
      {
        fields: {
          input: new common.TokenAmount(mainnetTokens.USDC, '1'),
          output: new common.TokenAmount(mainnetTokens.rUSDC, '1'),
          balanceBps: 5000,
        },
      },
    ];

    testCases.forEach(({ fields }) => {
      it(`deposit ${fields.input.token.symbol}${fields.balanceBps ? ' with balanceBps' : ''}`, async () => {
        const routerLogic = await logic.build(fields, { account });
        const sig = routerLogic.data.substring(0, 10);
        const { input, balanceBps } = fields;

        expect(routerLogic.to).to.eq(lendingPoolAddress);
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        expect(sig).to.eq(iface.getSighash('deposit'));
        expect(routerLogic.inputs[0].token).to.eq(input.token.wrapped.address);
        if (balanceBps) {
          expect(routerLogic.inputs[0].balanceBps).to.eq(balanceBps);
          expect(routerLogic.inputs[0].amountOrOffset).to.eq(common.getParamOffset(1));
        } else {
          expect(routerLogic.inputs[0].balanceBps).to.eq(core.BPS_NOT_USED);
          expect(routerLogic.inputs[0].amountOrOffset).eq(input.amountWei);
        }
        expect(routerLogic.wrapMode).to.eq(input.token.isNative ? core.WrapMode.wrapBefore : core.WrapMode.none);
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

import { LogicTestCase } from 'test/types';
import { Pool__factory } from './contracts';
import { Service } from './service';
import { SupplyLogic, SupplyLogicFields } from './logic.supply';
import * as common from '@composable-router/common';
import { constants, utils } from 'ethers';
import * as core from '@composable-router/core';
import { expect } from 'chai';
import { mainnetTokens } from './tokens';

describe('AaveV3 SupplyLogic', function () {
  context('Test getTokenList', async function () {
    SupplyLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.getNetworkId(chainId)}`, async function () {
        const logic = new SupplyLogic(chainId);
        const tokenList = await logic.getTokenList();
        expect(tokenList).to.have.lengthOf.above(0);
      });
    });
  });

  context('Test build', function () {
    const chainId = common.ChainId.mainnet;
    const logic = new SupplyLogic(chainId);
    let poolAddress: string;
    const iface = Pool__factory.createInterface();
    const account = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';

    before(async function () {
      const service = new Service(chainId);
      poolAddress = await service.getPoolAddress();
    });

    const testCases: LogicTestCase<SupplyLogicFields>[] = [
      {
        fields: {
          input: new common.TokenAmount(mainnetTokens.ETH, '1'),
          output: new common.TokenAmount(mainnetTokens.aEthWETH, '1'),
        },
      },
      {
        fields: {
          input: new common.TokenAmount(mainnetTokens.WETH, '1'),
          output: new common.TokenAmount(mainnetTokens.aEthWETH, '1'),
        },
      },
      {
        fields: {
          input: new common.TokenAmount(mainnetTokens.USDC, '1'),
          output: new common.TokenAmount(mainnetTokens.aEthUSDC, '1'),
        },
      },
      {
        fields: {
          input: new common.TokenAmount(mainnetTokens.ETH, '1'),
          output: new common.TokenAmount(mainnetTokens.aEthWETH, '1'),
          amountBps: 5000,
        },
      },
      {
        fields: {
          input: new common.TokenAmount(mainnetTokens.WETH, '1'),
          output: new common.TokenAmount(mainnetTokens.aEthWETH, '1'),
          amountBps: 5000,
        },
      },
      {
        fields: {
          input: new common.TokenAmount(mainnetTokens.USDC, '1'),
          output: new common.TokenAmount(mainnetTokens.aEthUSDC, '1'),
          amountBps: 5000,
        },
      },
    ];

    testCases.forEach(({ fields }) => {
      it(`supply ${fields.input.token.symbol}${fields.amountBps ? ' with amountBps' : ''}`, async function () {
        const routerLogic = await logic.build(fields, { account });
        const sig = routerLogic.data.substring(0, 10);
        const { input, amountBps } = fields;

        expect(routerLogic.to).to.eq(poolAddress);
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        expect(sig).to.eq(iface.getSighash('supply'));
        expect(routerLogic.inputs[0].token).to.eq(input.token.wrapped.address);
        if (amountBps) {
          expect(routerLogic.inputs[0].amountBps).to.eq(amountBps);
          expect(routerLogic.inputs[0].amountOrOffset).to.eq(common.getParamOffset(1));
        } else {
          expect(routerLogic.inputs[0].amountBps).to.eq(constants.MaxUint256);
          expect(routerLogic.inputs[0].amountOrOffset).eq(input.amountWei);
        }
        expect(routerLogic.wrapMode).to.eq(input.token.isNative ? core.WrapMode.wrapBefore : core.WrapMode.none);
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

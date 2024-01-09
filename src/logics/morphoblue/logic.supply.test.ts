import { LogicTestCase } from 'test/types';
import { Morpho__factory } from './contracts';
import { SupplyLogic, SupplyLogicFields } from './logic.supply';
import * as common from '@protocolink/common';
import { constants, utils } from 'ethers';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import { getContractAddress } from './configs';
import { mainnetTokens } from './tokens';

describe('MorphoBlue SupplyLogic', function () {
  context('Test getTokenList', async function () {
    SupplyLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.toNetworkId(chainId)}`, async function () {
        const logic = new SupplyLogic(chainId);
        const tokenList = await logic.getTokenList();
        const marketIds = Object.keys(tokenList);
        expect(marketIds).to.have.lengthOf.above(0);
        for (const marketId of marketIds) {
          expect(tokenList[marketId]).to.have.lengthOf.above(0);
        }
      });
    });
  });

  context('Test build', function () {
    const chainId = common.ChainId.mainnet;
    const logic = new SupplyLogic(chainId);
    const iface = Morpho__factory.createInterface();
    const account = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';

    const testCases: LogicTestCase<SupplyLogicFields>[] = [
      {
        fields: {
          marketId: '0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41',
          input: new common.TokenAmount(mainnetTokens.WETH, '1'),
        },
      },
      {
        fields: {
          marketId: '0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41',
          input: new common.TokenAmount(mainnetTokens.WETH, '1'),
          balanceBps: 5000,
        },
      },
      {
        fields: {
          marketId: '0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41',
          input: new common.TokenAmount(mainnetTokens.ETH, '1'),
        },
      },
      {
        fields: {
          marketId: '0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41',
          input: new common.TokenAmount(mainnetTokens.ETH, '1'),
          balanceBps: 5000,
        },
      },
    ];

    testCases.forEach(({ fields }) => {
      it(`supply ${fields.input.token.symbol} to ${fields.marketId} market${
        fields.balanceBps ? ' with balanceBps' : ''
      }`, async function () {
        const routerLogic = await logic.build(fields, { account });
        const sig = routerLogic.data.substring(0, 10);
        const { input, balanceBps } = fields;

        expect(routerLogic.to).to.eq(getContractAddress(chainId, 'Morpho'));
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        expect(sig).to.eq(iface.getSighash('supply'));
        expect(routerLogic.inputs[0].token).to.eq(input.token.wrapped.address);

        if (balanceBps) {
          expect(routerLogic.inputs[0].balanceBps).to.eq(balanceBps);
          expect(routerLogic.inputs[0].amountOrOffset).to.eq(common.getParamOffset(5));
        } else {
          expect(routerLogic.inputs[0].balanceBps).to.eq(core.BPS_NOT_USED);
          expect(routerLogic.inputs[0].amountOrOffset).to.eq(input.amountWei);
        }
        expect(routerLogic.wrapMode).to.eq(input.token.isNative ? core.WrapMode.wrapBefore : core.WrapMode.none);
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

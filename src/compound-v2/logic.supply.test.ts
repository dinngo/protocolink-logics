import { CErc20__factory, CEther__factory } from './contracts';
import { LogicTestCase } from 'test/types';
import { SupplyLogic, SupplyLogicFields } from './logic.supply';
import { cTokens, underlyingTokens } from './tokens';
import * as common from '@composable-router/common';
import { constants, utils } from 'ethers';
import { expect } from 'chai';

describe('CompoundV2 SupplyLogic', function () {
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
    const ifaceCEther = CEther__factory.createInterface();
    const ifaceCErc20 = CErc20__factory.createInterface();

    const testCases: LogicTestCase<SupplyLogicFields>[] = [
      {
        fields: {
          input: new common.TokenAmount(underlyingTokens.ETH, '1'),
          output: new common.TokenAmount(cTokens.cETH, '0'),
        },
      },
      {
        fields: {
          input: new common.TokenAmount(underlyingTokens.USDC, '1'),
          output: new common.TokenAmount(cTokens.cUSDC, '0'),
        },
      },
      {
        fields: {
          input: new common.TokenAmount(underlyingTokens.ETH, '1'),
          output: new common.TokenAmount(cTokens.cETH, '0'),
          amountBps: 5000,
        },
      },
      {
        fields: {
          input: new common.TokenAmount(underlyingTokens.USDC, '1'),
          output: new common.TokenAmount(cTokens.cUSDC, '0'),
          amountBps: 5000,
        },
      },
    ];

    testCases.forEach(({ fields }) => {
      it(`${fields.input.token.symbol} to ${fields.output.token.symbol}${
        fields.amountBps ? ' with amountBps' : ''
      }`, async function () {
        const routerLogic = await logic.build(fields);
        const sig = routerLogic.data.substring(0, 10);
        const { input, output, amountBps } = fields;

        expect(routerLogic.to).to.eq(output.token.address);
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        if (input.token.isNative) {
          expect(sig).to.eq(ifaceCEther.getSighash('mint'));
          expect(routerLogic.inputs[0].token).to.eq(common.ELASTIC_ADDRESS);
        } else {
          expect(sig).to.eq(ifaceCErc20.getSighash('mint'));
        }
        if (amountBps) {
          expect(routerLogic.inputs[0].amountBps).to.eq(amountBps);
          expect(routerLogic.inputs[0].amountOrOffset).to.eq(input.token.isNative ? constants.MaxUint256 : 0);
        } else {
          expect(routerLogic.inputs[0].amountBps).to.eq(constants.MaxUint256);
          expect(routerLogic.inputs[0].amountOrOffset).to.eq(input.amountWei);
        }
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

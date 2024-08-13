import { LogicTestCase } from 'test/types';
import { StargatePool__factory } from './contracts';
import { SwapTokenLogic, SwapTokenLogicFields, SwapTokenLogicOptions } from './logic.swap-token';
import * as common from '@protocolink/common';
import { constants, utils } from 'ethers';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import { getPoolByTokenAddress } from './configs';

describe('StargateV2 SwapTokenLogic', function () {
  context('Test getTokenList', async function () {
    SwapTokenLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.toNetworkId(chainId)}`, async function () {
        const logic = new SwapTokenLogic(chainId);
        const tokenList = await logic.getTokenList();
        expect(tokenList).to.have.lengthOf.above(0);
      });
    });
  });

  context('Test build', function () {
    const chainId = common.ChainId.mainnet;
    const logic = new SwapTokenLogic(chainId);
    const stgIface = StargatePool__factory.createInterface();
    const account = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';

    const testCases: LogicTestCase<SwapTokenLogicFields, SwapTokenLogicOptions>[] = [
      {
        fields: {
          input: new common.TokenAmount(common.mainnetTokens.ETH, '1'),
          output: new common.TokenAmount(common.optimismTokens.ETH, '1'),
          receiver: account,
          fee: '0',
          lzTokenFee: '0',
        },
        options: { account },
      },
      {
        fields: {
          input: new common.TokenAmount(common.mainnetTokens.USDC, '1'),
          output: new common.TokenAmount(common.optimismTokens.USDC, '1'),
          receiver: account,
          fee: '0.01',
          lzTokenFee: '0.01',
        },
        options: { account },
      },
      {
        fields: {
          input: new common.TokenAmount(common.mainnetTokens.USDC, '1'),
          output: new common.TokenAmount(common.optimismTokens.USDC, '1'),
          receiver: account,
          fee: '0.01',
          lzTokenFee: '0.01',
          balanceBps: 5000,
        },
        options: { account },
      },
    ];

    testCases.forEach(({ fields, options }) => {
      it(`${fields.input.token.symbol} to ${fields.output.token.symbol}`, async function () {
        const routerLogic = await logic.build(fields, options);
        const sig = routerLogic.data.substring(0, 10);
        const { input, balanceBps, fee } = fields;
        const poolAddress = getPoolByTokenAddress(chainId, input.token.address);

        expect(routerLogic.to).to.eq(poolAddress);
        expect(sig).to.eq(stgIface.getSighash('sendToken'));
        expect(routerLogic.inputs[0].token).to.eq(input.token.elasticAddress);
        expect(routerLogic.inputs[1].token).to.eq(common.mainnetTokens.ETH.elasticAddress);
        expect(routerLogic.inputs[1].amountOrOffset).to.eq(common.toSmallUnit(fee, common.mainnetTokens.ETH.decimals));
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;

        if (balanceBps) {
          expect(routerLogic.inputs[0].balanceBps).to.eq(balanceBps);
          expect(routerLogic.inputs[0].amountOrOffset).to.eq(common.getParamOffset(2));
        } else {
          expect(routerLogic.inputs[0].balanceBps).to.eq(core.BPS_NOT_USED);
          expect(routerLogic.inputs[0].amountOrOffset).eq(input.amountWei);
        }
        expect(routerLogic.wrapMode).to.eq(core.WrapMode.none);
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

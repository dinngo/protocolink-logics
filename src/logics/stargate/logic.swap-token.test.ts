import { LogicTestCase } from 'test/types';
import { RouterETH__factory, Router__factory, StargateToken__factory } from './contracts';
import { SwapTokenLogic, SwapTokenLogicFields, SwapTokenLogicOptions } from './logic.swap-token';
import * as common from '@protocolink/common';
import { constants, utils } from 'ethers';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import { getContractAddress, getSTGToken, isSTGToken } from './configs';
import { mainnetTokens, optimismTokens } from './tokens';

describe('Stargate SwapTokenLogic', function () {
  context('Test getTokenList', async function () {
    SwapTokenLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.toNetworkId(chainId)}`, async function () {
        const logic = new SwapTokenLogic(chainId);
        const tokenLists = await logic.getTokenList();

        expect(tokenLists).to.have.lengthOf.above(0);

        for (const tokenList of tokenLists) {
          expect(tokenList.destTokenLists).to.have.lengthOf.above(0);
          for (const destTokenList of tokenList.destTokenLists) {
            expect(destTokenList.tokens).to.have.lengthOf.above(0);
          }
        }
      });
    });
  });

  context('Test build', function () {
    const chainId = common.ChainId.mainnet;
    const logic = new SwapTokenLogic(chainId);
    const routerAddress = getContractAddress(chainId, 'Router');
    const routerETHAddress = getContractAddress(chainId, 'RouterETH');
    const STGAddress = getSTGToken(chainId).address;
    const routerIface = Router__factory.createInterface();
    const routerETHIface = RouterETH__factory.createInterface();
    const stgIface = StargateToken__factory.createInterface();
    const account = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';

    const testCases: LogicTestCase<SwapTokenLogicFields, SwapTokenLogicOptions>[] = [
      {
        fields: {
          input: new common.TokenAmount(mainnetTokens.ETH, '1'),
          output: new common.TokenAmount(optimismTokens.ETH, '1'),
          receiver: account,
          fee: '0.1',
          slippage: 500,
        },
        options: { account },
      },
      {
        fields: {
          input: new common.TokenAmount(mainnetTokens.USDC, '1'),
          output: new common.TokenAmount(optimismTokens['USDC.e'], '1'),
          receiver: account,
          fee: '0',
          slippage: 500,
        },
        options: { account },
      },
      {
        fields: {
          input: new common.TokenAmount(mainnetTokens.STG, '1'),
          output: new common.TokenAmount(optimismTokens.STG, '1'),
          receiver: account,
          fee: '0',
          slippage: 500,
        },
        options: { account },
      },
      {
        fields: {
          input: new common.TokenAmount(mainnetTokens.STG, '1'),
          output: new common.TokenAmount(optimismTokens.STG, '1'),
          receiver: account,
          fee: '0',
          slippage: 500,
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

        let paramOffsetIndex;

        if (isSTGToken(chainId, input.token)) {
          paramOffsetIndex = 2;
          expect(routerLogic.to).to.eq(STGAddress);
          expect(sig).to.eq(stgIface.getSighash('sendTokens'));
          expect(routerLogic.inputs[0].token).to.eq(input.token.wrapped.address);
        } else if (input.token.isNative) {
          paramOffsetIndex = 3;
          expect(routerLogic.to).to.eq(routerETHAddress);
          expect(sig).to.eq(routerETHIface.getSighash('swapETH'));
          expect(routerLogic.inputs[0].token).to.eq(input.token.elasticAddress);
        } else {
          paramOffsetIndex = 4;
          expect(routerLogic.to).to.eq(routerAddress);
          expect(sig).to.eq(routerIface.getSighash('swap'));
          expect(routerLogic.inputs[0].token).to.eq(input.token.wrapped.address);
        }

        expect(routerLogic.inputs[1].token).to.eq(mainnetTokens.ETH.elasticAddress);
        expect(routerLogic.inputs[1].amountOrOffset).to.eq(common.toSmallUnit(fee, mainnetTokens.ETH.decimals));
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;

        if (balanceBps) {
          expect(routerLogic.inputs[0].balanceBps).to.eq(balanceBps);
          expect(routerLogic.inputs[0].amountOrOffset).to.eq(common.getParamOffset(paramOffsetIndex));
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

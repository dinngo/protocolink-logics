import { LogicTestCase } from 'test/types';
import { SendTokenLogic, SendTokenLogicFields } from './logic.send-token';
import * as common from '@protocolink/common';
import { constants, utils } from 'ethers';
import * as core from '@protocolink/core';
import { expect } from 'chai';

describe('Utility SendTokenLogic', function () {
  context('Test getTokenList', async function () {
    SendTokenLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.toNetworkId(chainId)}`, async function () {
        const logic = new SendTokenLogic(chainId);
        const tokenList = await logic.getTokenList();
        expect(tokenList).to.have.lengthOf.above(0);
      });
    });
  });

  context('Test build', function () {
    const chainId = common.ChainId.mainnet;
    const logic = new SendTokenLogic(chainId);

    const iface = common.ERC20__factory.createInterface();

    const testCases: LogicTestCase<SendTokenLogicFields>[] = [
      {
        fields: {
          input: new common.TokenAmount(common.mainnetTokens.ETH, '1'),
          recipient: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
        },
      },
      {
        fields: {
          input: new common.TokenAmount(common.mainnetTokens.WETH, '1'),
          recipient: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
        },
      },
      {
        fields: {
          input: new common.TokenAmount(common.mainnetTokens.USDC, '1'),
          recipient: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
        },
      },
      {
        fields: {
          input: new common.TokenAmount(common.mainnetTokens.ETH, '1'),
          recipient: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
          balanceBps: 5000,
        },
      },
      {
        fields: {
          input: new common.TokenAmount(common.mainnetTokens.WETH, '1'),
          recipient: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
          balanceBps: 5000,
        },
      },
      {
        fields: {
          input: new common.TokenAmount(common.mainnetTokens.USDC, '1'),
          recipient: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
          balanceBps: 5000,
        },
      },
    ];

    testCases.forEach(({ fields }) => {
      it(`${fields.input.token.symbol} to ${fields.recipient}${
        fields.balanceBps ? ' with balanceBps' : ''
      }`, async function () {
        const routerLogic = await logic.build(fields);
        const sig = routerLogic.data.substring(0, 10);
        const { input, recipient, balanceBps } = fields;

        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        if (input.token.isNative) {
          expect(routerLogic.to).to.eq(recipient);
          expect(routerLogic.data).to.eq('0x');
          expect(routerLogic.inputs[0].token).to.eq(common.ELASTIC_ADDRESS);
        } else {
          expect(routerLogic.to).to.eq(input.token.address);
          expect(sig).to.eq(iface.getSighash('transfer'));
        }
        if (balanceBps) {
          expect(routerLogic.inputs[0].balanceBps).to.eq(balanceBps);
          expect(routerLogic.inputs[0].amountOrOffset).to.eq(input.token.isNative ? core.OFFSET_NOT_USED : 32);
        } else {
          expect(routerLogic.inputs[0].balanceBps).to.eq(core.BPS_NOT_USED);
          expect(routerLogic.inputs[0].amountOrOffset).to.eq(input.amountWei);
        }
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

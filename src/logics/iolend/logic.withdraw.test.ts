import { LogicTestCase } from 'test/types';
import { Service } from './service';
import { WithdrawLogic, WithdrawLogicFields } from './logic.withdraw';
import * as common from '@protocolink/common';
import { constants, utils } from 'ethers';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import { iotaTokens } from './tokens';

describe('Iolend WithdrawLogic', () => {
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
    const chainId = common.ChainId.iota;
    const logic = new WithdrawLogic(chainId);
    let lendingPoolAddress: string;
    const account = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';

    before(async () => {
      const service = new Service(chainId);
      lendingPoolAddress = await service.getLendingPoolAddress();
    });

    const testCases: LogicTestCase<WithdrawLogicFields>[] = [
      {
        fields: {
          input: new common.TokenAmount(iotaTokens.iWIOTA, '100'),
          output: new common.TokenAmount(common.iotaTokens.IOTA, '100'),
        },
      },
      {
        fields: {
          input: new common.TokenAmount(iotaTokens.iWIOTA, '100'),
          output: new common.TokenAmount(common.iotaTokens.wIOTA, '100'),
        },
      },
      {
        fields: {
          input: new common.TokenAmount(iotaTokens.iUSDT, '100'),
          output: new common.TokenAmount(common.iotaTokens.USDT, '100'),
        },
      },
      {
        fields: {
          input: new common.TokenAmount(iotaTokens.iWIOTA, '100'),
          output: new common.TokenAmount(common.iotaTokens.IOTA, '100'),
          balanceBps: 5000,
        },
      },
      {
        fields: {
          input: new common.TokenAmount(iotaTokens.iWIOTA, '100'),
          output: new common.TokenAmount(common.iotaTokens.wIOTA, '100'),
          balanceBps: 5000,
        },
      },
      {
        fields: {
          input: new common.TokenAmount(iotaTokens.iUSDT, '100'),
          output: new common.TokenAmount(common.iotaTokens.USDT, '100'),
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
        expect(sig).to.be.eq('0x69328dec'); // cmp sig directly to avoid Error: multiple matching functions
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

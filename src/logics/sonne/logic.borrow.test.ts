import { BorrowLogic, BorrowLogicFields, BorrowLogicOptions } from './logic.borrow';
import { LogicTestCase } from 'test/types';
import * as common from '@protocolink/common';
import { constants, utils } from 'ethers';
import { expect } from 'chai';
import { optimismTokens } from './tokens';
import * as smartAccounts from '@protocolink/smart-accounts';

describe('Sonne BorrowLogic', function () {
  context('Test getTokenList', async function () {
    BorrowLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.toNetworkId(chainId)}`, async function () {
        const logic = new BorrowLogic(chainId);
        const tokenList = await logic.getTokenList();
        expect(tokenList).to.have.lengthOf.above(0);
      });
    });
  });

  context('Test build', function () {
    const chainId = common.ChainId.optimism;
    const logic = new BorrowLogic(chainId);

    const testCases: LogicTestCase<BorrowLogicFields, BorrowLogicOptions>[] = [
      {
        fields: {
          tokenIn: optimismTokens.WBTC,
          output: new common.TokenAmount(optimismTokens.ETH, '1'),
          smartAccountId: smartAccounts.SmartAccountId.PORTUS,
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      },
      {
        fields: {
          tokenIn: optimismTokens.WBTC,
          output: new common.TokenAmount(optimismTokens.USDC, '1'),
          smartAccountId: smartAccounts.SmartAccountId.PORTUS,
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      },
    ];

    testCases.forEach(({ fields, options }) => {
      it(`borrow ${fields.output.token.symbol}`, async function () {
        const routerLogic = await logic.build(fields, options);

        expect(routerLogic.to).to.eq(smartAccounts.getSmartAccount(chainId, fields.smartAccountId).executor);
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;

        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

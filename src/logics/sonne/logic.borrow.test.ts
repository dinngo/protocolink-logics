import { BorrowLogic, BorrowLogicFields, BorrowLogicOptions } from './logic.borrow';
import { LogicTestCase } from 'test/types';
import { ProtocolinkCallbackExecutor__factory } from './contracts';
import * as common from '@protocolink/common';
import { constants, utils } from 'ethers';
import { expect } from 'chai';
import { optimismTokens } from './tokens';
import { toExecutor } from './configs';

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
    const ifaceExecutor = ProtocolinkCallbackExecutor__factory.createInterface();

    const testCases: LogicTestCase<BorrowLogicFields, BorrowLogicOptions>[] = [
      {
        fields: {
          output: new common.TokenAmount(optimismTokens.WETH, '1'),
          smartId: '1',
        },
        options: { account: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' },
      },
    ];

    testCases.forEach(({ fields, options }) => {
      it(`borrow ${fields.output.token.symbol}`, async function () {
        const routerLogic = await logic.build(fields, options);
        const sig = routerLogic.data.substring(0, 10);

        expect(routerLogic.to).to.eq(toExecutor(chainId, fields.smartId));
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;

        expect(sig).to.eq(ifaceExecutor.getSighash('executeFromAgent'));

        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

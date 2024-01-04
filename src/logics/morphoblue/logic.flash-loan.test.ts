import { FlashLoanLogic, FlashLoanLogicFields } from './logic.flash-loan';
import { LogicTestCase } from 'test/types';
import { Morpho__factory } from './contracts';
import * as common from '@protocolink/common';
import { constants, utils } from 'ethers';
import { expect } from 'chai';
import { getContractAddress } from './configs';
import { goerliTokens } from './tokens';

describe('Morphoblue FlashLoanLogic', function () {
  context('Test getTokenList', async function () {
    FlashLoanLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.toNetworkId(chainId)}`, async function () {
        const logic = new FlashLoanLogic(chainId);
        const tokenList = await logic.getTokenList();
        expect(tokenList).to.have.lengthOf.above(0);
      });
    });
  });

  context('Test build', function () {
    const chainId = common.ChainId.goerli;
    const logic = new FlashLoanLogic(chainId);
    const iface = Morpho__factory.createInterface();

    const testCases: LogicTestCase<FlashLoanLogicFields>[] = [
      {
        fields: {
          loans: new common.TokenAmounts([goerliTokens.WETH, '1']),
          params: '0x',
        },
      },
    ];

    testCases.forEach(({ fields }) => {
      it(`flash loan ${fields.loans.map((loan) => loan.token.symbol).join(',')}`, async function () {
        const routerLogic = await logic.build(fields);
        const sig = routerLogic.data.substring(0, 10);

        expect(routerLogic.to).to.eq(getContractAddress(chainId, 'MorphoFlashLoanCallback'));
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        expect(sig).to.eq(iface.getSighash('flashLoan'));
        expect(routerLogic.inputs).to.deep.eq([]);
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(getContractAddress(chainId, 'MorphoFlashLoanCallback'));
      });
    });
  });
});

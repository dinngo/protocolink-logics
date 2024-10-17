import { FlashLoanLogic, FlashLoanLogicFields } from './logic.flash-loan';
import { LendingPool__factory } from './contracts';
import { LogicTestCase } from 'test/types';
import { Service } from './service';
import { arbitrumTokens } from './tokens';
import * as common from '@protocolink/common';
import { constants, utils } from 'ethers';
import { expect } from 'chai';
import { getContractAddress } from './configs';

describe.skip('RadiantV2 FlashLoanLogic', () => {
  context('Test getTokenList', async () => {
    FlashLoanLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.toNetworkId(chainId)}`, async () => {
        const logic = new FlashLoanLogic(chainId);
        const tokenList = await logic.getTokenList();
        expect(tokenList).to.have.lengthOf.above(0);
      });
    });
  });

  context('Test build', () => {
    const chainId = common.ChainId.arbitrum;
    const logic = new FlashLoanLogic(chainId);
    let lendingPoolAddress: string;
    const iface = LendingPool__factory.createInterface();

    before(async () => {
      const service = new Service(chainId);
      lendingPoolAddress = await service.getLendingPoolAddress();
    });

    const testCases: LogicTestCase<FlashLoanLogicFields>[] = [
      {
        fields: {
          loans: new common.TokenAmounts([arbitrumTokens.WETH, '1'], [arbitrumTokens.USDC, '1']),
          params: '0x',
        },
      },
    ];

    testCases.forEach(({ fields }) => {
      it(`flash loan ${fields.loans.map((loan) => loan.token.symbol).join(',')}`, async () => {
        const routerLogic = await logic.build(fields);
        const sig = routerLogic.data.substring(0, 10);

        expect(routerLogic.to).to.eq(lendingPoolAddress);
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        expect(sig).to.eq(iface.getSighash('flashLoan'));
        expect(routerLogic.inputs).to.deep.eq([]);
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(getContractAddress(chainId, 'RadiantV2FlashLoanCallback'));
      });
    });
  });
});

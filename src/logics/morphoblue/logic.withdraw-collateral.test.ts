import { LogicTestCase } from 'test/types';
import { Morpho__factory } from './contracts';
import { WithdrawCollateralLogic, WithdrawCollateralLogicFields } from './logic.withdraw-collateral';
import * as common from '@protocolink/common';
import { constants, utils } from 'ethers';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import { getContractAddress } from './configs';
import { goerliTokens } from './tokens';

describe('MorphoBlue WithdrawCollateralLogic', function () {
  context('Test getTokenList', async function () {
    WithdrawCollateralLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.toNetworkId(chainId)}`, async function () {
        const logic = new WithdrawCollateralLogic(chainId);
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
    const chainId = common.ChainId.goerli;
    const logic = new WithdrawCollateralLogic(chainId);
    const iface = Morpho__factory.createInterface();
    const account = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';

    const testCases: LogicTestCase<WithdrawCollateralLogicFields>[] = [
      {
        fields: {
          marketId: '0x3098a46de09dd8d9a8c6fa1ab7b3f943b6f13e5ea72a4e475d9e48f222bfd5a0',
          output: new common.TokenAmount(goerliTokens.DAI, '1'),
        },
      },
      {
        fields: {
          marketId: '0x98ee9f294c961a5dbb9073c0fd2c2a6a66468f911e49baa935c0eab364499dbd',
          output: new common.TokenAmount(goerliTokens.WETH, '1'),
        },
      },
      {
        fields: {
          marketId: '0x98ee9f294c961a5dbb9073c0fd2c2a6a66468f911e49baa935c0eab364499dbd',
          output: new common.TokenAmount(goerliTokens.ETH, '1'),
        },
      },
    ];

    testCases.forEach(({ fields }) => {
      it(`withdraw ${fields.output.token.symbol} from ${fields.marketId} market`, async function () {
        const routerLogic = await logic.build(fields, { account });
        const sig = routerLogic.data.substring(0, 10);
        const { output } = fields;

        expect(routerLogic.to).to.eq(getContractAddress(chainId, 'Morpho'));
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        expect(sig).to.eq(iface.getSighash('withdrawCollateral'));
        expect(routerLogic.inputs).to.deep.eq([]);
        expect(routerLogic.wrapMode).to.eq(output.token.isNative ? core.WrapMode.unwrapAfter : core.WrapMode.none);
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

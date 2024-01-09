import { LogicTestCase } from 'test/types';
import { Morpho__factory } from './contracts';
import { WithdrawLogic, WithdrawLogicFields } from './logic.withdraw';
import * as common from '@protocolink/common';
import { constants, utils } from 'ethers';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import { getContractAddress } from './configs';
import { mainnetTokens } from './tokens';

describe('MorphoBlue WithdrawLogic', function () {
  context('Test getTokenList', async function () {
    WithdrawLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.toNetworkId(chainId)}`, async function () {
        const logic = new WithdrawLogic(chainId);
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
    const chainId = common.ChainId.mainnet;
    const logic = new WithdrawLogic(chainId);
    const iface = Morpho__factory.createInterface();
    const account = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';

    const testCases: LogicTestCase<WithdrawLogicFields>[] = [
      {
        fields: {
          marketId: '0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41',
          output: new common.TokenAmount(mainnetTokens.WETH, '1'),
        },
      },
      {
        fields: {
          marketId: '0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41',
          output: new common.TokenAmount(mainnetTokens.ETH, '1'),
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
        expect(sig).to.eq(iface.getSighash('withdraw'));
        expect(routerLogic.inputs).to.deep.eq([]);
        expect(routerLogic.wrapMode).to.eq(output.token.isNative ? core.WrapMode.unwrapAfter : core.WrapMode.none);
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

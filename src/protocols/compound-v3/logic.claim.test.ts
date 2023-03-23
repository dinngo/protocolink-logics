import { COMP } from './tokens';
import { ClaimLogic, ClaimLogicFields } from './logic.claim';
import { CometRewards__factory } from './contracts';
import { LogicTestCase } from 'test/types';
import { MarketId, getContractAddress } from './config';
import * as common from '@composable-router/common';
import { constants, utils } from 'ethers';
import { expect } from 'chai';

describe('CompoundV3 ClaimLogic', function () {
  context('Test getTokenList', async function () {
    ClaimLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.getNetworkId(chainId)}`, async function () {
        const compoundV3ClaimLogic = new ClaimLogic(chainId);
        const tokenList = await compoundV3ClaimLogic.getTokenList();
        expect(tokenList.length).to.eq(1);
      });
    });
  });

  context('Test getLogic', function () {
    const chainId = common.ChainId.mainnet;
    const compoundV3ClaimLogic = new ClaimLogic(chainId);
    const ifaceCometRewards = CometRewards__factory.createInterface();
    const owner = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';

    const testCases: LogicTestCase<ClaimLogicFields>[] = [
      { fields: { marketId: MarketId.USDC, owner, output: new common.TokenAmount(COMP(chainId), '1') } },
      { fields: { marketId: MarketId.ETH, owner, output: new common.TokenAmount(COMP(chainId), '1') } },
    ];

    testCases.forEach(({ fields }) => {
      it(`claim the rewards of ${fields.marketId} market`, async function () {
        const routerLogic = await compoundV3ClaimLogic.getLogic(fields);
        const sig = routerLogic.data.substring(0, 10);

        expect(routerLogic.to).to.eq(getContractAddress(chainId, 'CometRewards'));
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        expect(sig).to.eq(ifaceCometRewards.getSighash('claim'));
        expect(routerLogic.inputs).to.deep.eq([]);
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

import { Comet__factory } from './contracts';
import { LogicTestCase } from 'test/types';
import { MarketId, getMarket } from './config';
import { RepayLogic, RepayLogicFields } from './logic.repay';
import * as common from '@composable-router/common';
import { constants, utils } from 'ethers';
import { expect } from 'chai';
import { mainnetTokens } from './tokens';

describe('CompoundV3 RepayLogic', function () {
  context('Test getTokenList', async function () {
    RepayLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.getNetworkId(chainId)}`, async function () {
        const compoundV3RepayLogic = new RepayLogic(chainId);
        const tokenList = await compoundV3RepayLogic.getTokenList();
        expect(Object.keys(tokenList).length).to.be.gt(0);
      });
    });
  });

  context('Test getLogic', function () {
    const chainId = common.ChainId.mainnet;
    const compoundV3RepayLogic = new RepayLogic(chainId);
    const ifaceComet = Comet__factory.createInterface();
    const account = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';

    const testCases: LogicTestCase<RepayLogicFields>[] = [
      { fields: { marketId: MarketId.USDC, input: new common.TokenAmount(mainnetTokens.USDC, '1') } },
      { fields: { marketId: MarketId.ETH, input: new common.TokenAmount(mainnetTokens.ETH.wrapped, '1') } },
    ];

    testCases.forEach(({ fields }) => {
      it(`repay ${fields.input.token.symbol} to ${fields.marketId} market`, async function () {
        const routerLogic = await compoundV3RepayLogic.getLogic(fields, { account });
        const sig = routerLogic.data.substring(0, 10);
        const { marketId, input } = fields;
        const market = getMarket(chainId, marketId);

        expect(routerLogic.to).to.eq(market.cometAddress);
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        expect(sig).to.eq(ifaceComet.getSighash('supplyTo'));
        expect(routerLogic.inputs[0].amountBps).to.eq(constants.MaxUint256);
        expect(routerLogic.inputs[0].amountOrOffset).to.eq(input.amountWei);
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

import { Comet__factory } from './contracts';
import { LogicTestCase } from 'test/types';
import { MarketId, getMarket } from './config';
import { WithdrawCollateralLogic, WithdrawCollateralLogicFields } from './logic.withdraw-collateral';
import * as common from '@protocolink/common';
import { constants, utils } from 'ethers';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import { mainnetTokens } from './tokens';

describe('CompoundV3 WithdrawCollateralLogic', function () {
  context('Test getTokenList', async function () {
    WithdrawCollateralLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.toNetworkId(chainId)}`, async function () {
        const logic = new WithdrawCollateralLogic(chainId);
        const tokenList = await logic.getTokenList();
        expect(Object.keys(tokenList).length).to.be.gt(0);
        for (const marketId of Object.keys(tokenList)) {
          expect(tokenList[marketId].length).to.gt(0);
        }
      });
    });
  });

  context('Test build', function () {
    const chainId = common.ChainId.mainnet;
    const logic = new WithdrawCollateralLogic(chainId);
    const iface = Comet__factory.createInterface();
    const account = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';

    const testCases: LogicTestCase<WithdrawCollateralLogicFields>[] = [
      { fields: { marketId: MarketId.USDC, output: new common.TokenAmount(mainnetTokens.ETH, '1') } },
      { fields: { marketId: MarketId.USDC, output: new common.TokenAmount(mainnetTokens.WETH, '1') } },
      { fields: { marketId: MarketId.USDC, output: new common.TokenAmount(mainnetTokens.WBTC, '1') } },
      { fields: { marketId: MarketId.ETH, output: new common.TokenAmount(mainnetTokens.cbETH, '1') } },
      { fields: { marketId: MarketId.ETH, output: new common.TokenAmount(mainnetTokens.wstETH, '1') } },
    ];

    testCases.forEach(({ fields }) => {
      it(`withdraw ${fields.output.token.symbol} from ${fields.marketId} market`, async function () {
        const routerLogic = await logic.build(fields, { account });
        const sig = routerLogic.data.substring(0, 10);
        const { marketId, output } = fields;
        const market = getMarket(chainId, marketId);

        expect(routerLogic.to).to.eq(market.cometAddress);
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        expect(sig).to.eq(iface.getSighash('withdrawFrom'));
        expect(routerLogic.inputs).to.deep.eq([]);
        expect(routerLogic.wrapMode).to.eq(output.token.isNative ? core.WrapMode.unwrapAfter : core.WrapMode.none);
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

import { Comet__factory } from './contracts';
import { LogicTestCase } from 'test/types';
import { MarketId, getMarket } from './config';
import { WithdrawCollateralLogic, WithdrawCollateralLogicFields } from './logic.withdraw-collateral';
import * as common from '@composable-router/common';
import { constants, utils } from 'ethers';
import { expect } from 'chai';
import { mainnetTokens } from './tokens';

describe('CompoundV3 WithdrawCollateralLogic', function () {
  context('Test getTokenList', async function () {
    WithdrawCollateralLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.getNetworkId(chainId)}`, async function () {
        const compoundV3WithdrawCollateralLogic = new WithdrawCollateralLogic(chainId);
        const tokenList = await compoundV3WithdrawCollateralLogic.getTokenList();
        expect(Object.keys(tokenList).length).to.be.gt(0);
        for (const marketId of Object.keys(tokenList)) {
          expect(tokenList[marketId].length).to.gt(0);
        }
      });
    });
  });

  context('Test getLogic', function () {
    const chainId = common.ChainId.mainnet;
    const compoundV3WithdrawCollateralLogic = new WithdrawCollateralLogic(chainId);
    const ifaceComet = Comet__factory.createInterface();
    const account = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';

    const testCases: LogicTestCase<WithdrawCollateralLogicFields>[] = [
      { fields: { marketId: MarketId.USDC, output: new common.TokenAmount(mainnetTokens.ETH.wrapped, '1') } },
      { fields: { marketId: MarketId.USDC, output: new common.TokenAmount(mainnetTokens.WBTC, '1') } },
      { fields: { marketId: MarketId.ETH, output: new common.TokenAmount(mainnetTokens.cbETH, '1') } },
      { fields: { marketId: MarketId.ETH, output: new common.TokenAmount(mainnetTokens.wstETH, '1') } },
    ];

    testCases.forEach(({ fields }) => {
      it(`withdraw ${fields.output.token.symbol} from ${fields.marketId} market`, async function () {
        const routerLogic = await compoundV3WithdrawCollateralLogic.getLogic(fields, { account });
        const sig = routerLogic.data.substring(0, 10);
        const { marketId } = fields;
        const market = getMarket(chainId, marketId);

        expect(routerLogic.to).to.eq(market.cometAddress);
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        expect(sig).to.eq(ifaceComet.getSighash('withdrawFrom'));
        expect(routerLogic.inputs).to.deep.eq([]);
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

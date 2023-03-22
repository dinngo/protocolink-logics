import { Comet__factory } from './contracts';
import { LogicTestCase } from 'test/types';
import { WithdrawBaseLogic, WithdrawBaseLogicFields } from './logic.withdraw-base';
import * as common from '@composable-router/common';
import { constants, utils } from 'ethers';
import { expect } from 'chai';
import { getMarket } from './config';
import { mainnetTokens } from './tokens';

describe('CompoundV3 WithdrawBaseLogic', function () {
  context('Test getTokenList', async function () {
    WithdrawBaseLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.getNetworkId(chainId)}`, async function () {
        const withdrawBaseLogic = new WithdrawBaseLogic(chainId);
        const tokenList = await withdrawBaseLogic.getTokenList();
        expect(Object.keys(tokenList).length).to.be.gt(0);
        for (const marketId of Object.keys(tokenList)) {
          expect(tokenList[marketId].length).to.eq(2);
        }
      });
    });
  });

  context('Test getLogic', function () {
    const chainId = common.ChainId.mainnet;
    const compoundV3WithdrawBaseLogic = new WithdrawBaseLogic(chainId);
    const ifaceComet = Comet__factory.createInterface();
    const account = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';

    const testCases: LogicTestCase<WithdrawBaseLogicFields>[] = [
      {
        fields: {
          marketId: 'USDC',
          input: new common.TokenAmount(mainnetTokens.cUSDCv3, '1'),
          output: new common.TokenAmount(mainnetTokens.USDC, '0'),
        },
      },
      {
        fields: {
          marketId: 'USDC',
          input: new common.TokenAmount(mainnetTokens.cUSDCv3, '1'),
          output: new common.TokenAmount(mainnetTokens.USDC, '0'),
          amountBps: 5000,
        },
      },
      {
        fields: {
          marketId: 'ETH',
          input: new common.TokenAmount(mainnetTokens.cWETHv3, '1'),
          output: new common.TokenAmount(mainnetTokens.ETH, '0'),
        },
      },
      {
        fields: {
          marketId: 'ETH',
          input: new common.TokenAmount(mainnetTokens.cWETHv3, '1'),
          output: new common.TokenAmount(mainnetTokens.ETH, '0'),
          amountBps: 5000,
        },
      },
    ];

    testCases.forEach(({ fields }) => {
      it(`withdraw ${fields.input.token.symbol} from ${fields.marketId} market${
        fields.amountBps ? ' with amountBps' : ''
      }`, async function () {
        const routerLogic = await compoundV3WithdrawBaseLogic.getLogic(fields, { account });
        const sig = routerLogic.data.substring(0, 10);
        const { marketId, input, output, amountBps } = fields;
        const market = getMarket(chainId, marketId);
        const ifaceBulker = new utils.Interface(market.bulker.abi);

        if (output.token.isNative) {
          expect(routerLogic.to).to.eq(market.bulker.address);
          expect(sig).to.eq(ifaceBulker.getSighash('invoke'));
        } else {
          expect(routerLogic.to).to.eq(market.cometAddress);
          expect(sig).to.eq(ifaceComet.getSighash('withdraw'));
        }
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        if (amountBps) {
          expect(routerLogic.inputs[0].amountBps).to.eq(amountBps);
          expect(routerLogic.inputs[0].amountOrOffset).to.eq(output.token.isNative ? 288 : 32);
        } else {
          expect(routerLogic.inputs[0].amountBps).to.eq(constants.MaxUint256);
          expect(routerLogic.inputs[0].amountOrOffset).to.eq(input.amountWei);
        }
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

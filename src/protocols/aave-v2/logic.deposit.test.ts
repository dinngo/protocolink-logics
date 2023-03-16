import { DepositLogic, DepositLogicFields } from './logic.deposit';
import { LendingPool__factory } from './contracts';
import { LogicTestCase } from 'test/types';
import { Service } from './service';
import * as common from '@composable-router/common';
import { constants, utils } from 'ethers';
import { expect } from 'chai';
import { mainnetTokens } from './tokens';

describe('AaveV2 DepositLogic', function () {
  context('Test getTokenList', async function () {
    DepositLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.getNetworkId(chainId)}`, async function () {
        const borrowLogic = new DepositLogic(chainId);
        const tokens = await borrowLogic.getTokenList();
        expect(tokens.length).to.be.gt(0);
      });
    });
  });

  context('Test getLogic', function () {
    const chainId = common.ChainId.mainnet;
    const aaveV2DepositLogic = new DepositLogic(chainId);
    let lendingPoolAddress: string;
    const lendingPoolIface = LendingPool__factory.createInterface();
    const account = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';

    before(async function () {
      const service = new Service(chainId);
      lendingPoolAddress = await service.getLendingPoolAddress();
    });

    const testCases: LogicTestCase<DepositLogicFields>[] = [
      {
        fields: {
          input: new common.TokenAmount(mainnetTokens.WETH, '1'),
          output: new common.TokenAmount(mainnetTokens.aWETH, '1'),
        },
      },
      {
        fields: {
          input: new common.TokenAmount(mainnetTokens.USDC, '1'),
          output: new common.TokenAmount(mainnetTokens.aUSDC, '1'),
        },
      },
      {
        fields: {
          input: new common.TokenAmount(mainnetTokens.WETH, '1'),
          output: new common.TokenAmount(mainnetTokens.aWETH, '1'),
          amountBps: 5000,
        },
      },
      {
        fields: {
          input: new common.TokenAmount(mainnetTokens.USDC, '1'),
          output: new common.TokenAmount(mainnetTokens.aUSDC, '1'),
          amountBps: 5000,
        },
      },
    ];

    testCases.forEach(({ fields }) => {
      it(`deposit ${fields.input.token.symbol}${fields.amountBps ? ' with amountBps' : ''}`, async function () {
        const routerLogic = await aaveV2DepositLogic.getLogic(fields, { account });
        const sig = routerLogic.data.substring(0, 10);
        const { input, amountBps } = fields;

        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        expect(routerLogic.to).to.eq(lendingPoolAddress);
        expect(sig).to.eq(lendingPoolIface.getSighash('deposit'));
        if (amountBps) {
          expect(routerLogic.inputs[0].amountBps).to.eq(amountBps);
          expect(routerLogic.inputs[0].amountOrOffset).to.eq(common.getParamOffset(1));
        } else {
          expect(routerLogic.inputs[0].amountBps).to.eq(constants.MaxUint256);
          expect(routerLogic.inputs[0].amountOrOffset).eq(input.amountWei);
        }
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

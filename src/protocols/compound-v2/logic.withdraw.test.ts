import { CErc20__factory } from './contracts';
import { LogicTestCase } from 'test/types';
import { WithdrawLogic, WithdrawLogicFields } from './logic.withdraw';
import { cTokens, underlyingTokens } from './tokens';
import * as common from '@composable-router/common';
import { constants, utils } from 'ethers';
import { expect } from 'chai';

describe('CompoundV2 WithdrawLogic', function () {
  context('Test getTokenList', async function () {
    WithdrawLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.getNetworkId(chainId)}`, async function () {
        const withdrawLogic = new WithdrawLogic(chainId);
        const tokenList = await withdrawLogic.getTokenList();
        expect(tokenList).to.have.lengthOf.above(0);
      });
    });
  });

  context('Test getLogic', function () {
    const chainId = common.ChainId.mainnet;
    const compoundV2WithdrawLogic = new WithdrawLogic(chainId);
    const cErc20 = CErc20__factory.createInterface();

    const testCases: LogicTestCase<WithdrawLogicFields>[] = [
      {
        fields: {
          input: new common.TokenAmount(cTokens.cETH, '1'),
          output: new common.TokenAmount(underlyingTokens.ETH, '0'),
        },
      },
      {
        fields: {
          input: new common.TokenAmount(cTokens.cUSDC, '1'),
          output: new common.TokenAmount(underlyingTokens.USDC, '0'),
        },
      },
      {
        fields: {
          input: new common.TokenAmount(cTokens.cETH, '1'),
          output: new common.TokenAmount(underlyingTokens.ETH, '0'),
          amountBps: 5000,
        },
      },
      {
        fields: {
          input: new common.TokenAmount(cTokens.cUSDC, '1'),
          output: new common.TokenAmount(underlyingTokens.USDC, '0'),
          amountBps: 5000,
        },
      },
    ];

    testCases.forEach(({ fields }) => {
      it(`${fields.input.token.symbol} to ${fields.output.token.symbol}${
        fields.amountBps ? ' with amountBps' : ''
      }`, async function () {
        const routerLogic = await compoundV2WithdrawLogic.getLogic(fields);
        const sig = routerLogic.data.substring(0, 10);
        const { input, amountBps } = fields;

        expect(routerLogic.to).to.eq(input.token.address);
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        expect(sig).to.eq(cErc20.getSighash('redeem'));
        if (amountBps) {
          expect(routerLogic.inputs[0].amountBps).to.eq(amountBps);
          expect(routerLogic.inputs[0].amountOrOffset).to.eq(0);
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

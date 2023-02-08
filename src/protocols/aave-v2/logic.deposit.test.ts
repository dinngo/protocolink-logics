import { AaveV2DepositLogic } from './logic.deposit';
import { LendingPool__factory, WETHGateway__factory } from './contracts';
import { constants, utils } from 'ethers';
import * as core from 'src/core';
import { expect } from 'chai';
import { mainnet } from './tokens/data';
import * as rt from 'src/router';

describe('AaveV2DepositLogic', function () {
  const chainId = core.network.ChainId.mainnet;
  const aavev2DepositLogic = new AaveV2DepositLogic({ chainId });

  context('Test getPrice', function () {
    const cases = [
      { input: new core.tokens.TokenAmount(core.tokens.mainnet.ETH, '1'), tokenOut: mainnet.aWETH },
      { input: new core.tokens.TokenAmount(mainnet.WETH, '1'), tokenOut: mainnet.aWETH },
      { input: new core.tokens.TokenAmount(mainnet.USDC, '1'), tokenOut: mainnet.aUSDC },
    ];

    cases.forEach(({ input, tokenOut }) => {
      it(`deposit ${input.token.symbol}`, async function () {
        const output = await aavev2DepositLogic.getPrice({ input, tokenOut });
        expect(output.amount).to.eq(input.amount);
      });
    });
  });

  context('Test getLogic', function () {
    const lendingPoolIface = LendingPool__factory.createInterface();
    const wethGatewayIface = WETHGateway__factory.createInterface();

    const cases = [
      {
        input: new core.tokens.TokenAmount(core.tokens.mainnet.ETH, '1'),
        output: new core.tokens.TokenAmount(mainnet.aWETH, '1'),
      },
      {
        input: new core.tokens.TokenAmount(mainnet.WETH, '1'),
        output: new core.tokens.TokenAmount(mainnet.aWETH, '1'),
      },
      {
        input: new core.tokens.TokenAmount(mainnet.USDC, '1'),
        output: new core.tokens.TokenAmount(mainnet.aUSDC, '1'),
      },
    ];

    cases.forEach(({ input, output }) => {
      it(`deposit ${input.token.symbol}`, async function () {
        const logic = await aavev2DepositLogic.getLogic({
          routerAddress: rt.config.getContractAddress(chainId, 'Router'),
          input,
          output,
        });
        const sig = logic.data.substring(0, 10);

        expect(utils.isBytesLike(logic.data)).to.be.true;
        if (input.token.isNative()) {
          const wethGatewayAddress = await aavev2DepositLogic.service.getWETHGatewayAddress();
          expect(logic.to).to.eq(wethGatewayAddress);
          expect(sig).to.eq(wethGatewayIface.getSighash('depositETH'));
          expect(logic.inputs[0].token).to.eq(core.tokens.ELASTIC_ADDRESS);
          expect(logic.inputs[0].doApprove).to.be.false;
        } else {
          const lendingPoolAddress = await aavev2DepositLogic.service.getLendingPoolAddress();
          expect(logic.to).to.eq(lendingPoolAddress);
          expect(sig).to.eq(lendingPoolIface.getSighash('deposit'));
          expect(logic.inputs[0].doApprove).to.be.true;
        }
        expect(logic.inputs[0].amountBps).to.eq(constants.MaxUint256);
        expect(logic.inputs[0].amountOrOffset).eq(input.amountWei);
        expect(logic.outputs).to.deep.eq([]);
        expect(logic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

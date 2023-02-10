import { ParaswapV5SwapTokenLogic } from './logic.swap-token';
import { constants, utils } from 'ethers';
import * as core from 'src/core';
import { expect } from 'chai';
import { getContractAddress } from './config';

describe('ParaswapV5SwapTokenLogic', function () {
  const chainId = core.network.ChainId.mainnet;
  const paraswapV5SwapToken = new ParaswapV5SwapTokenLogic({ chainId });

  context('Test getPrice', function () {
    const cases = [
      { input: new core.tokens.TokenAmount(core.tokens.mainnet.ETH, '1'), tokenOut: core.tokens.mainnet.USDC },
      { input: new core.tokens.TokenAmount(core.tokens.mainnet.USDC, '1'), tokenOut: core.tokens.mainnet.ETH },
      { input: new core.tokens.TokenAmount(core.tokens.mainnet.USDC, '1'), tokenOut: core.tokens.mainnet.DAI },
    ];

    cases.forEach(({ input, tokenOut }) => {
      it(`${input.token.symbol} to ${tokenOut.symbol}`, async function () {
        const output = await paraswapV5SwapToken.getPrice({ input, tokenOut });
        expect(output.amountWei.gt(0)).to.be.true;
      });
    });
  });

  context('Test getLogic', function () {
    const cases = [
      {
        account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        slippage: 500,
        input: new core.tokens.TokenAmount(core.tokens.mainnet.ETH, '1'),
        output: new core.tokens.TokenAmount(core.tokens.mainnet.USDC),
      },
      {
        account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        slippage: 500,
        input: new core.tokens.TokenAmount(core.tokens.mainnet.USDC, '1'),
        output: new core.tokens.TokenAmount(core.tokens.mainnet.ETH),
      },
      {
        account: '0xa3C1C91403F0026b9dd086882aDbC8Cdbc3b3cfB',
        slippage: 500,
        input: new core.tokens.TokenAmount(core.tokens.mainnet.USDC, '1'),
        output: new core.tokens.TokenAmount(core.tokens.mainnet.DAI),
      },
    ];

    cases.forEach(({ input, output, ...others }) => {
      it(`${input.token.symbol} to ${output.token.symbol}`, async function () {
        const logic = await paraswapV5SwapToken.getLogic({ input, output, ...others });

        expect(logic.to).to.eq('0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57');
        expect(utils.isBytesLike(logic.data)).to.be.true;
        if (input.token.isNative()) {
          expect(logic.inputs[0].token).to.eq(core.tokens.ELASTIC_ADDRESS);
        }
        expect(logic.inputs[0].amountBps).to.eq(constants.MaxUint256);
        expect(logic.inputs[0].amountOrOffset).to.eq(input.amountWei);
        if (output.token.isNative()) {
          expect(logic.outputs[0].token).to.eq(core.tokens.ELASTIC_ADDRESS);
        }
        expect(logic.approveTo).to.eq(getContractAddress(chainId, 'TokenTransferProxy'));
        expect(logic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});

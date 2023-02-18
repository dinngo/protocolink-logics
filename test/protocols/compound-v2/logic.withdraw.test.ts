import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, mainnetTokens } from '@composable-router/test-helpers';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';
import * as protocols from 'src/protocols';
import * as utils from 'test/utils';

describe('Test CompoundV2 Withdraw Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    await claimToken(chainId, user.address, mainnetTokens.ETH, '100');
    await claimToken(chainId, user.address, mainnetTokens.USDC, '100');
  });

  const testCases = [
    {
      input: new common.TokenAmount(protocols.compoundv2.cTokens.cETH, '50'),
      tokenOut: protocols.compoundv2.underlyingTokens.ETH,
    },
    {
      input: new common.TokenAmount(protocols.compoundv2.cTokens.cUSDC, '50'),
      tokenOut: protocols.compoundv2.underlyingTokens.USDC,
    },
    {
      input: new common.TokenAmount(protocols.compoundv2.cTokens.cETH, '50'),
      tokenOut: protocols.compoundv2.underlyingTokens.ETH,
      amountBps: 5000,
    },
    {
      input: new common.TokenAmount(protocols.compoundv2.cTokens.cUSDC, '50'),
      tokenOut: protocols.compoundv2.underlyingTokens.USDC,
      amountBps: 5000,
    },
  ];

  testCases.forEach(({ input, tokenOut, amountBps }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. get output
      const compoundV2Withdraw = new protocols.compoundv2.WithdrawLogic(chainId, hre.ethers.provider);
      const output = await compoundV2Withdraw.getPrice({ input, tokenOut });

      // 2. supply
      const underlyingToken = output.token;
      const supplyAmount = new common.TokenAmount(underlyingToken, '3');
      await helpers.supply(user, supplyAmount);

      // 3. build funds, tokensReturn
      const tokensReturn = [output.token.elasticAddress];
      const funds = new common.TokenAmounts();
      if (amountBps) {
        funds.add(utils.calcRequiredFundByAmountBps(input, amountBps));
        tokensReturn.push(input.token.elasticAddress);
      } else {
        funds.add(input);
      }

      // 4. build router logics
      const erc20Funds = funds.erc20;
      const routerLogics = await utils.getPermitAndPullTokenRouterLogics(chainId, user, erc20Funds);
      routerLogics.push(await compoundV2Withdraw.getLogic({ input, output, amountBps }));

      // 5. send router tx
      const transactionRequest = core.newRouterExecuteTransactionRequest({ chainId, routerLogics, tokensReturn });
      await expect(user.sendTransaction(transactionRequest)).not.to.be.reverted;
      await expect(user.address).to.changeBalance(input.token, -input.amount);
      await expect(user.address).to.changeBalance(output.token, output.amount, 1);
    });
  });
});

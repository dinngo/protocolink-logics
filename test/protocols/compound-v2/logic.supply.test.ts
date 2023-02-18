import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, mainnetTokens } from '@composable-router/test-helpers';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as protocols from 'src/protocols';
import * as utils from 'test/utils';

describe('Test CompoundV2 Supply Logic', function () {
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
      input: new common.TokenAmount(protocols.compoundv2.underlyingTokens.ETH, '1'),
      tokenOut: protocols.compoundv2.cTokens.cETH,
    },
    {
      input: new common.TokenAmount(protocols.compoundv2.underlyingTokens.USDC, '10'),
      tokenOut: protocols.compoundv2.cTokens.cUSDC,
    },
    {
      input: new common.TokenAmount(protocols.compoundv2.underlyingTokens.ETH, '1'),
      tokenOut: protocols.compoundv2.cTokens.cETH,
      amountBps: 5000,
    },
    {
      input: new common.TokenAmount(protocols.compoundv2.underlyingTokens.USDC, '10'),
      tokenOut: protocols.compoundv2.cTokens.cUSDC,
      amountBps: 5000,
    },
  ];

  testCases.forEach(({ input, tokenOut, amountBps }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. get output
      const compoundV2Supply = new protocols.compoundv2.SupplyLogic(chainId, hre.ethers.provider);
      const output = await compoundV2Supply.getPrice({ input, tokenOut });

      // 2. build funds, tokensReturn
      const tokensReturn = [output.token.elasticAddress];
      const funds = new common.TokenAmounts();
      if (amountBps) {
        funds.add(utils.calcRequiredFundByAmountBps(input, amountBps));
        tokensReturn.push(input.token.elasticAddress);
      } else {
        funds.add(input);
      }

      // 3. build router logics
      const erc20Funds = funds.erc20;
      const routerLogics = await utils.getPermitAndPullTokenRouterLogics(chainId, user, erc20Funds);
      routerLogics.push(await compoundV2Supply.getLogic({ input, output, amountBps }));

      // 4. send router tx
      const transactionRequest = core.newRouterExecuteTransactionRequest({
        chainId,
        routerLogics,
        tokensReturn,
        value: funds.native?.amountWei ?? 0,
      });
      await expect(user.sendTransaction(transactionRequest)).not.to.be.reverted;
      await expect(user.address).to.changeBalance(input.token, -input.amount);
      await expect(user.address).to.changeBalance(output.token, output.amount, 1);
    });
  });
});

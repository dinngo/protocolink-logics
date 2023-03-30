import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, snapshotAndRevertEach } from '@composable-router/test-helpers';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';
import * as protocols from 'src/protocols';
import * as utils from 'test/utils';

describe('Test CompoundV3 WithdrawBase Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    await claimToken(chainId, user.address, protocols.compoundv3.mainnetTokens.USDC, '1000');
    await claimToken(chainId, user.address, protocols.compoundv3.mainnetTokens.WETH, '10');
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      marketId: protocols.compoundv3.MarketId.USDC,
      input: new common.TokenAmount(protocols.compoundv3.mainnetTokens.cUSDCv3, '1'),
      tokenOut: protocols.compoundv3.mainnetTokens.USDC,
    },
    {
      marketId: protocols.compoundv3.MarketId.USDC,
      input: new common.TokenAmount(protocols.compoundv3.mainnetTokens.cUSDCv3, '1'),
      tokenOut: protocols.compoundv3.mainnetTokens.USDC,
      amountBps: 5000,
    },
    {
      marketId: protocols.compoundv3.MarketId.ETH,
      input: new common.TokenAmount(protocols.compoundv3.mainnetTokens.cWETHv3, '1'),
      tokenOut: protocols.compoundv3.mainnetTokens.ETH,
    },
    {
      marketId: protocols.compoundv3.MarketId.ETH,
      input: new common.TokenAmount(protocols.compoundv3.mainnetTokens.cWETHv3, '1'),
      tokenOut: protocols.compoundv3.mainnetTokens.ETH,
      amountBps: 5000,
    },
    {
      marketId: protocols.compoundv3.MarketId.ETH,
      input: new common.TokenAmount(protocols.compoundv3.mainnetTokens.cWETHv3, '1'),
      tokenOut: protocols.compoundv3.mainnetTokens.WETH,
    },
    {
      marketId: protocols.compoundv3.MarketId.ETH,
      input: new common.TokenAmount(protocols.compoundv3.mainnetTokens.cWETHv3, '1'),
      tokenOut: protocols.compoundv3.mainnetTokens.WETH,
      amountBps: 5000,
    },
  ];

  testCases.forEach(({ marketId, input, tokenOut, amountBps }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. supply first
      const supply = new common.TokenAmount(tokenOut.wrapped, '3');
      await helpers.supply(chainId, user, marketId, supply);
      await expect(user.address).to.changeBalance(supply.token, supply.amount, 1);

      // 2. get quotation
      const compoundV3WithdrawBaseLogic = new protocols.compoundv3.WithdrawBaseLogic(chainId, hre.ethers.provider);
      const { output } = await compoundV3WithdrawBaseLogic.quote({ marketId, input, tokenOut });

      // 3. build funds, tokensReturn
      const tokensReturn = [output.token.elasticAddress];
      const funds = new common.TokenAmounts();
      if (amountBps) {
        funds.add(utils.calcRequiredAmountByAmountBps(input, amountBps));
        tokensReturn.push(input.token.elasticAddress);
      } else {
        funds.add(input);
      }

      // 4. build router logics
      const erc20Funds = funds.erc20;
      const routerLogics = await utils.getPermitAndPullTokenRouterLogics(chainId, user, erc20Funds);
      routerLogics.push(await compoundV3WithdrawBaseLogic.getLogic({ marketId, input, output, amountBps }));

      // 5. send router tx
      const transactionRequest = core.newRouterExecuteTransactionRequest({
        chainId,
        routerLogics,
        tokensReturn,
        value: funds.native?.amountWei ?? 0,
      });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
      await expect(user.address).to.changeBalance(input.token, -input.amount, 1);
      await expect(user.address).to.changeBalance(output.token, output.amount, 1);
    });
  });
});

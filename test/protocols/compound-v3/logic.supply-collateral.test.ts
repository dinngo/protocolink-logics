import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId } from '@composable-router/test-helpers';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as protocols from 'src/protocols';
import * as utils from 'test/utils';

describe('Test CompoundV3 Supply Collateral Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;
  let compoundV3Service: protocols.compoundv3.Service;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    compoundV3Service = new protocols.compoundv3.Service(chainId, hre.ethers.provider);
    await claimToken(chainId, user.address, protocols.compoundv3.mainnetTokens.WBTC, '10');
    await claimToken(chainId, user.address, protocols.compoundv3.mainnetTokens.cbETH, '10');
    await claimToken(chainId, user.address, protocols.compoundv3.mainnetTokens.wstETH, '10');
  });

  const testCases = [
    {
      marketId: protocols.compoundv3.MarketId.USDC,
      input: new common.TokenAmount(protocols.compoundv3.mainnetTokens.ETH, '1'),
    },
    {
      marketId: protocols.compoundv3.MarketId.USDC,
      input: new common.TokenAmount(protocols.compoundv3.mainnetTokens.ETH, '1'),
      amountBps: 5000,
    },
    {
      marketId: protocols.compoundv3.MarketId.USDC,
      input: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WBTC, '1'),
    },
    {
      marketId: protocols.compoundv3.MarketId.USDC,
      input: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WBTC, '1'),
      amountBps: 5000,
    },
    {
      marketId: protocols.compoundv3.MarketId.ETH,
      input: new common.TokenAmount(protocols.compoundv3.mainnetTokens.cbETH, '1'),
    },
    {
      marketId: protocols.compoundv3.MarketId.ETH,
      input: new common.TokenAmount(protocols.compoundv3.mainnetTokens.cbETH, '1'),
      amountBps: 5000,
    },
    {
      marketId: protocols.compoundv3.MarketId.ETH,
      input: new common.TokenAmount(protocols.compoundv3.mainnetTokens.wstETH, '1'),
    },
    {
      marketId: protocols.compoundv3.MarketId.ETH,
      input: new common.TokenAmount(protocols.compoundv3.mainnetTokens.wstETH, '1'),
      amountBps: 5000,
    },
  ];

  testCases.forEach(({ marketId, input, amountBps }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. build funds, tokensReturn
      const tokensReturn = [];
      const funds = new common.TokenAmounts();
      if (amountBps) {
        funds.add(utils.calcRequiredAmountByAmountBps(input, amountBps));
        tokensReturn.push(input.token.elasticAddress);
      } else {
        funds.add(input);
      }

      // 2. build router logics
      const erc20Funds = funds.erc20;
      const routerLogics = await utils.getPermitAndPullTokenRouterLogics(chainId, user, erc20Funds);
      const compoundV3SupplyCollateralLogic = new protocols.compoundv3.SupplyCollateralLogic(
        chainId,
        hre.ethers.provider
      );
      routerLogics.push(
        await compoundV3SupplyCollateralLogic.getLogic({ marketId, input, amountBps }, { account: user.address })
      );

      // 3. send router tx
      const transactionRequest = core.newRouterExecuteTransactionRequest({
        chainId,
        routerLogics,
        tokensReturn,
        value: funds.native?.amountWei ?? 0,
      });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
      const collateralBalance = await compoundV3Service.getCollateralBalance(user.address, marketId, input.token);
      expect(collateralBalance.amountWei).to.eq(input.amountWei);
    });
  });
});

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, mainnetTokens } from '@composable-router/test-helpers';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as protocols from 'src/protocols';
import * as utils from 'test/utils';

describe('Test CompoundV3 Supply Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    await claimToken(chainId, user.address, mainnetTokens.WBTC, '10');
    await claimToken(chainId, user.address, protocols.compoundv3.mainnetTokens.cbETH, '10');
    await claimToken(chainId, user.address, protocols.compoundv3.mainnetTokens.wstETH, '10');
  });

  const testCases = [
    {
      marketId: 'USDC',
      input: new common.TokenAmount(protocols.compoundv3.mainnetTokens.ETH, '1'),
    },
    {
      marketId: 'USDC',
      input: new common.TokenAmount(protocols.compoundv3.mainnetTokens.ETH, '1'),
      amountBps: 5000,
    },
    {
      marketId: 'USDC',
      input: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WBTC, '1'),
    },
    {
      marketId: 'USDC',
      input: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WBTC, '1'),
      amountBps: 5000,
    },
    {
      marketId: 'ETH',
      input: new common.TokenAmount(protocols.compoundv3.mainnetTokens.cbETH, '1'),
    },
    {
      marketId: 'ETH',
      input: new common.TokenAmount(protocols.compoundv3.mainnetTokens.cbETH, '1'),
      amountBps: 5000,
    },
    {
      marketId: 'ETH',
      input: new common.TokenAmount(protocols.compoundv3.mainnetTokens.wstETH, '1'),
    },
    {
      marketId: 'ETH',
      input: new common.TokenAmount(protocols.compoundv3.mainnetTokens.wstETH, '1'),
      amountBps: 5000,
    },
  ];

  testCases.forEach(({ marketId, input, amountBps }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. get output
      const compoundV3Supply = new protocols.compoundv3.SupplyCollateralLogic(chainId, hre.ethers.provider);

      // 2. build funds, tokensReturn
      const tokensReturn = [];
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
      routerLogics.push(await compoundV3Supply.getLogic({ marketId, input, amountBps }, { account: user.address }));

      // 4. send router tx
      const transactionRequest = core.newRouterExecuteTransactionRequest({
        chainId,
        routerLogics,
        tokensReturn,
        value: funds.native?.amountWei ?? 0,
      });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;

      const market = protocols.compoundv3.getMarket(chainId, marketId);
      const contractComet = protocols.compoundv3.Comet__factory.connect(market.cTokenAddress, hre.ethers.provider);
      const collateralBalance = await contractComet.collateralBalanceOf(user.address, input.token.wrapped.address);
      expect(collateralBalance).to.eq(input.amountWei);
    });
  });
});

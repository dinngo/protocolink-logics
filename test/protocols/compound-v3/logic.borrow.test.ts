import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, snapshotAndRevertEach } from '@composable-router/test-helpers';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';
import * as protocols from 'src/protocols';

describe('Test CompoundV3 Borrow Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;
  let userAgent: string;
  let compoundV3Service: protocols.compoundv3.Service;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    userAgent = core.calcAccountAgent(chainId, user.address);
    compoundV3Service = new protocols.compoundv3.Service(chainId, hre.ethers.provider);
    await claimToken(chainId, user.address, protocols.compoundv3.mainnetTokens.WETH, '10');
    await claimToken(chainId, user.address, protocols.compoundv3.mainnetTokens.WBTC, '10');
    await claimToken(chainId, user.address, protocols.compoundv3.mainnetTokens.cbETH, '10');
    await claimToken(chainId, user.address, protocols.compoundv3.mainnetTokens.wstETH, '10');
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      marketId: protocols.compoundv3.MarketId.USDC,
      supply: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WETH, '1'),
      borrow: new common.TokenAmount(protocols.compoundv3.mainnetTokens.USDC, '100'),
    },
    {
      marketId: protocols.compoundv3.MarketId.USDC,
      supply: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WBTC, '1'),
      borrow: new common.TokenAmount(protocols.compoundv3.mainnetTokens.USDC, '100'),
    },
    {
      marketId: protocols.compoundv3.MarketId.ETH,
      supply: new common.TokenAmount(protocols.compoundv3.mainnetTokens.cbETH, '3'),
      borrow: new common.TokenAmount(protocols.compoundv3.mainnetTokens.ETH, '1'),
    },
    {
      marketId: protocols.compoundv3.MarketId.ETH,
      supply: new common.TokenAmount(protocols.compoundv3.mainnetTokens.cbETH, '3'),
      borrow: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WETH, '1'),
    },
    {
      marketId: protocols.compoundv3.MarketId.ETH,
      supply: new common.TokenAmount(protocols.compoundv3.mainnetTokens.wstETH, '3'),
      borrow: new common.TokenAmount(protocols.compoundv3.mainnetTokens.ETH, '1'),
    },
    {
      marketId: protocols.compoundv3.MarketId.ETH,
      supply: new common.TokenAmount(protocols.compoundv3.mainnetTokens.wstETH, '3'),
      borrow: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WETH, '1'),
    },
  ];

  testCases.forEach(({ marketId, supply, borrow }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. check can supply or not
      const canSupply = await compoundV3Service.canSupply(marketId, supply);
      if (!canSupply) return;

      // 2. supply first
      await helpers.supply(chainId, user, marketId, supply);

      // 3. allow userAgent to manage user's collaterals
      await helpers.allow(chainId, user, marketId);
      const isAllowed = await compoundV3Service.isAllowed(marketId, user.address, userAgent);
      expect(isAllowed).to.be.true;

      // 4. build funds, tokensReturn
      const output = borrow;
      const tokensReturn = [output.token.elasticAddress];
      const funds = new common.TokenAmounts();

      // 5. build router logics
      const routerLogics: core.IParam.LogicStruct[] = [];
      const compoundV3BorrowLogic = new protocols.compoundv3.BorrowLogic(chainId, hre.ethers.provider);
      routerLogics.push(await compoundV3BorrowLogic.getLogic({ marketId, output }, { account: user.address }));

      // 6. send router tx
      const transactionRequest = core.newRouterExecuteTransactionRequest({
        chainId,
        routerLogics,
        tokensReturn,
        value: funds.native?.amountWei ?? 0,
      });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
      const borrowBalance = await compoundV3Service.getBorrowBalance(user.address, marketId);
      expect(borrowBalance.amountWei).to.eq(output.amountWei);
      await expect(user.address).to.changeBalance(output.token, output.amount);
    });
  });
});

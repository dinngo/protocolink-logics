import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, snapshotAndRevertEach } from '@composable-router/test-helpers';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';
import * as protocols from 'src/protocols';

describe('Test CompoundV3 WithdrawCollateral Logic', function () {
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
      output: new common.TokenAmount(protocols.compoundv3.mainnetTokens.ETH, '1'),
    },
    {
      marketId: protocols.compoundv3.MarketId.USDC,
      output: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WETH, '1'),
    },
    {
      marketId: protocols.compoundv3.MarketId.USDC,
      output: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WBTC, '1'),
    },
    {
      marketId: protocols.compoundv3.MarketId.ETH,
      output: new common.TokenAmount(protocols.compoundv3.mainnetTokens.cbETH, '1'),
    },
    {
      marketId: protocols.compoundv3.MarketId.ETH,
      output: new common.TokenAmount(protocols.compoundv3.mainnetTokens.wstETH, '1'),
    },
  ];

  testCases.forEach(({ marketId, output }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. check can supply or not
      const supply = new common.TokenAmount(output.token.wrapped, '3');
      const canSupply = await compoundV3Service.canSupply(marketId, supply);
      if (!canSupply) return;

      // 2. supply first
      await helpers.supply(chainId, user, marketId, supply);

      // 3. allow userAgent to manage user's collaterals
      await helpers.allow(chainId, user, marketId);
      const isAllowed = await compoundV3Service.isAllowed(marketId, user.address, userAgent);
      expect(isAllowed).to.be.true;

      // 4. build funds, tokensReturn
      const tokensReturn = [output.token.elasticAddress];

      // 5. build router logics
      const routerLogics: core.IParam.LogicStruct[] = [];
      const compoundV3WithdrawCollateralLogic = new protocols.compoundv3.WithdrawCollateralLogic(
        chainId,
        hre.ethers.provider
      );
      routerLogics.push(
        await compoundV3WithdrawCollateralLogic.getLogic({ marketId, output }, { account: user.address })
      );

      // 6. send router tx
      const transactionRequest = core.newRouterExecuteTransactionRequest({ chainId, routerLogics, tokensReturn });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
      const collateralBalance = await compoundV3Service.getCollateralBalance(user.address, marketId, output.token);
      expect(supply.amountWei.sub(collateralBalance.amountWei)).to.eq(output.amountWei);
      await expect(user.address).to.changeBalance(output.token, output.amount);
    });
  });
});

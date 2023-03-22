import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId } from '@composable-router/test-helpers';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';
import * as protocols from 'src/protocols';

describe('Test CompoundV3 Withdraw Collateral Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;
  let userAgent: string;
  let compoundV3Service: protocols.compoundv3.Service;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    userAgent = core.calcAccountAgent(chainId, user.address);
    compoundV3Service = new protocols.compoundv3.Service(chainId, hre.ethers.provider);
    await claimToken(chainId, user.address, protocols.compoundv3.mainnetTokens.ETH.wrapped, '10');
    await claimToken(chainId, user.address, protocols.compoundv3.mainnetTokens.WBTC, '10');
    await claimToken(chainId, user.address, protocols.compoundv3.mainnetTokens.cbETH, '10');
    await claimToken(chainId, user.address, protocols.compoundv3.mainnetTokens.wstETH, '10');
  });

  const testCases = [
    {
      marketId: 'USDC',
      output: new common.TokenAmount(protocols.compoundv3.mainnetTokens.ETH.wrapped, '1'),
    },
    // {
    //   marketId: 'USDC',
    //   output: new common.TokenAmount(protocols.compoundv3.mainnetTokens.WBTC, '1'),
    // },
    // {
    //   marketId: 'ETH',
    //   output: new common.TokenAmount(protocols.compoundv3.mainnetTokens.cbETH, '1'),
    // },
    // {
    //   marketId: 'ETH',
    //   output: new common.TokenAmount(protocols.compoundv3.mainnetTokens.wstETH, '1'),
    // },
  ];

  testCases.forEach(({ marketId, output }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. supply first
      const supply = new common.TokenAmount(output.token, '3');
      await helpers.supply(chainId, user, marketId, supply);

      // 2. allow userAgent to manage user's collaterals
      await helpers.allow(chainId, user, marketId);
      const isAllowed = await compoundV3Service.isAllowed(marketId, user.address, userAgent);
      expect(isAllowed).to.be.true;

      // 1. build funds, tokensReturn
      const tokensReturn = [output.token.elasticAddress];
      const funds = new common.TokenAmounts();

      // 2. build router logics
      const routerLogics: core.IParam.LogicStruct[] = [];
      const compoundV3WithdrawCollateralLogic = new protocols.compoundv3.WithdrawCollateralLogic(
        chainId,
        hre.ethers.provider
      );
      routerLogics.push(
        await compoundV3WithdrawCollateralLogic.getLogic({ marketId, output }, { account: user.address })
      );

      // 3. send router tx
      const transactionRequest = core.newRouterExecuteTransactionRequest({
        chainId,
        routerLogics,
        tokensReturn,
        value: funds.native?.amountWei ?? 0,
      });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
      const collateralBalance = await helpers.getCollateralBalance(chainId, user.address, marketId, output.token);
      expect(supply.sub(collateralBalance).amountWei).to.eq(output.amountWei);
      await expect(user.address).to.changeBalance(output.token, output.amount);
    });
  });
});

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as compoundv3 from 'src/logics/compound-v3';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';

describe('mainnet-pb: Test CompoundV3 WithdrawCollateral Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;
  let routerKit: core.RouterKit;
  let agent: string;
  let service: compoundv3.Service;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    routerKit = new core.RouterKit(chainId);
    agent = await routerKit.calcAgent(user.address);
    service = new compoundv3.Service(chainId, hre.ethers.provider);
    await claimToken(chainId, user.address, compoundv3.mainnetTokens.WETH, '10');
    await claimToken(
      chainId,
      user.address,
      compoundv3.mainnetTokens.WBTC,
      '10',
      '0x9ff58f4ffb29fa2266ab25e75e2a8b3503311656'
    );
    await claimToken(chainId, user.address, compoundv3.mainnetTokens.cbETH, '10');
    await claimToken(chainId, user.address, compoundv3.mainnetTokens.wstETH, '10');
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      marketId: compoundv3.MarketId.USDC,
      output: new common.TokenAmount(compoundv3.mainnetTokens.ETH, '1'),
    },
    {
      marketId: compoundv3.MarketId.USDC,
      output: new common.TokenAmount(compoundv3.mainnetTokens.WETH, '1'),
    },
    {
      marketId: compoundv3.MarketId.USDC,
      output: new common.TokenAmount(compoundv3.mainnetTokens.WBTC, '1'),
    },
    {
      marketId: compoundv3.MarketId.ETH,
      output: new common.TokenAmount(compoundv3.mainnetTokens.cbETH, '1'),
    },
    {
      marketId: compoundv3.MarketId.ETH,
      output: new common.TokenAmount(compoundv3.mainnetTokens.wstETH, '1'),
    },
  ];

  testCases.forEach(({ marketId, output }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. check can supply or not
      const supply = new common.TokenAmount(output.token.wrapped, '3');
      const canSupply = await service.canSupply(marketId, supply);
      if (!canSupply) return;

      // 2. supply first
      await helpers.supply(chainId, user, marketId, supply);

      // 3. allow userAgent to manage user's collaterals
      await helpers.allow(chainId, user, marketId);
      const isAllowed = await service.isAllowed(marketId, user.address, agent);
      expect(isAllowed).to.be.true;

      // 4. build funds, tokensReturn
      const tokensReturn = [output.token.elasticAddress];

      // 5. build router logics
      const routerLogics: core.DataType.LogicStruct[] = [];
      const compoundV3WithdrawCollateralLogic = new compoundv3.WithdrawCollateralLogic(chainId, hre.ethers.provider);
      routerLogics.push(await compoundV3WithdrawCollateralLogic.build({ marketId, output }, { account: user.address }));

      // 5. send router tx
      const transactionRequest = routerKit.buildExecuteTransactionRequest({ routerLogics, tokensReturn });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
      const collateralBalance = await service.getCollateralBalance(marketId, user.address, output.token);
      expect(supply.amountWei.sub(collateralBalance.amountWei)).to.eq(output.amountWei);
      await expect(user.address).to.changeBalance(output.token, output.amount);
    });
  });
});

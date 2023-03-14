import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, mainnetTokens } from '@composable-router/test-helpers';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';
import * as hrehelpers from '@nomicfoundation/hardhat-network-helpers';
import * as protocols from 'src/protocols';

describe('Test CompoundV2 ClaimCOMP Logic', function () {
  let chainId: number;
  let users: SignerWithAddress[];

  before(async function () {
    chainId = await getChainId();
    const [, user1, user2] = await hre.ethers.getSigners();
    users = [user1, user2];
    await claimToken(chainId, user1.address, mainnetTokens.USDC, '5000');
  });

  // https://app.compound.finance/markets?market=1_Compound+V2_0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B
  const testCases = [
    {
      userIndex: 0,
      claimerIndex: 0,
      supply: new common.TokenAmount(protocols.compoundv2.underlyingTokens.ETH, '1'),
      borrow: new common.TokenAmount(protocols.compoundv2.underlyingTokens.USDC, '100'),
    },
    {
      userIndex: 0,
      claimerIndex: 0,
      supply: new common.TokenAmount(protocols.compoundv2.underlyingTokens.USDC, '3000'),
      borrow: new common.TokenAmount(protocols.compoundv2.underlyingTokens.ETH, '1'),
    },
    {
      userIndex: 0,
      claimerIndex: 1,
      supply: new common.TokenAmount(protocols.compoundv2.underlyingTokens.ETH, '1'),
      borrow: new common.TokenAmount(protocols.compoundv2.underlyingTokens.USDC, '100'),
    },
    {
      userIndex: 0,
      claimerIndex: 1,
      supply: new common.TokenAmount(protocols.compoundv2.underlyingTokens.USDC, '3000'),
      borrow: new common.TokenAmount(protocols.compoundv2.underlyingTokens.ETH, '1'),
    },
  ];

  testCases.forEach(({ userIndex, claimerIndex, supply, borrow }, i) => {
    it(`case ${i + 1}`, async function () {
      const owner = users[userIndex];
      const claimer = users[claimerIndex];

      // 1. supply, enterMarkets and borrow first
      await helpers.supply(owner, supply);
      await helpers.enterMarkets(owner, [supply.token]);
      await helpers.borrow(owner, borrow);

      // 2. get allocated COMP amount after 1000 blocks
      await hrehelpers.mine(1000);
      const compoundV2ClaimCOMP = new protocols.compoundv2.ClaimCOMPLogic(chainId, hre.ethers.provider);
      const output = await compoundV2ClaimCOMP.getReward(owner.address);
      expect(output.amountWei).to.be.gt(0);

      // 4. build tokensReturn
      const tokensReturn = [output.token.address];

      // 5. build router logics
      const routerLogics: core.IParam.LogicStruct[] = [];
      routerLogics.push(await compoundV2ClaimCOMP.getLogic({ owner: owner.address }));

      // 6. send router tx
      const transactionRequest = core.newRouterExecuteTransactionRequest({ chainId, routerLogics, tokensReturn });
      await expect(claimer.sendTransaction(transactionRequest)).to.not.be.reverted;
      await expect(owner.address).to.changeBalance(output.token, output.amount, 1);
    });
  });
});

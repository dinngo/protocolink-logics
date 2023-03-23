import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId } from '@composable-router/test-helpers';
import * as common from '@composable-router/common';
import * as core from '@composable-router/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';
import * as hrehelpers from '@nomicfoundation/hardhat-network-helpers';
import * as protocols from 'src/protocols';

describe('Test CompoundV3 Claim Logic', function () {
  let chainId: number;
  let users: SignerWithAddress[];

  before(async function () {
    chainId = await getChainId();
    const [, user1, user2] = await hre.ethers.getSigners();
    users = [user1, user2];
    await claimToken(chainId, user1.address, protocols.compoundv3.mainnetTokens.USDC, '1000');
  });

  const testCases = [
    {
      ownerIndex: 0,
      claimerIndex: 0,
      marketId: protocols.compoundv3.MarketId.USDC,
      supply: new common.TokenAmount(protocols.compoundv3.mainnetTokens.ETH, '1'),
      borrow: new common.TokenAmount(protocols.compoundv3.mainnetTokens.USDC, '100'),
    },
    {
      ownerIndex: 0,
      claimerIndex: 1,
      marketId: protocols.compoundv3.MarketId.USDC,
      supply: new common.TokenAmount(protocols.compoundv3.mainnetTokens.ETH, '1'),
      borrow: new common.TokenAmount(protocols.compoundv3.mainnetTokens.USDC, '100'),
    },
    {
      ownerIndex: 0,
      claimerIndex: 0,
      marketId: protocols.compoundv3.MarketId.ETH,
      supply: new common.TokenAmount(protocols.compoundv3.mainnetTokens.ETH, '1000'),
    },
    {
      ownerIndex: 0,
      claimerIndex: 1,
      marketId: protocols.compoundv3.MarketId.ETH,
      supply: new common.TokenAmount(protocols.compoundv3.mainnetTokens.ETH, '1000'),
    },
  ];

  testCases.forEach(({ ownerIndex, claimerIndex, marketId, supply, borrow }, i) => {
    it(`case ${i + 1}`, async function () {
      const owner = users[ownerIndex];
      const claimer = users[claimerIndex];

      // 1. supply or borrow first
      await helpers.supply(chainId, owner, marketId, supply);
      if (borrow) {
        await helpers.borrow(chainId, owner, marketId, borrow); // USDC market supply apr 0%, borrow apr 3.69%
      }

      // 2. get rewards amount after 1000 blocks
      await hrehelpers.mine(1000);
      const compoundV3ClaimLogic = new protocols.compoundv3.ClaimLogic(chainId, hre.ethers.provider);
      const { output } = await compoundV3ClaimLogic.quote({ marketId, owner: owner.address });
      expect(output.amountWei).to.be.gt(0);

      // 3. build router logics
      const routerLogics: core.IParam.LogicStruct[] = [];
      routerLogics.push(await compoundV3ClaimLogic.getLogic({ marketId, owner: owner.address, output }));

      // 4. send router tx
      const transactionRequest = core.newRouterExecuteTransactionRequest({ chainId, routerLogics });
      await expect(claimer.sendTransaction(transactionRequest)).to.not.be.reverted;
      await expect(owner.address).to.changeBalance(output.token, output.amount, 1);
    });
  });
});

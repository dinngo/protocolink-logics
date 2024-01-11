import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as compoundv3 from 'src/logics/compound-v3';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';
import * as hrehelpers from '@nomicfoundation/hardhat-network-helpers';

describe('mainnet-pb: Test CompoundV3 Claim Logic', function () {
  let chainId: number;
  let users: SignerWithAddress[];
  let service: compoundv3.Service;

  before(async function () {
    chainId = await getChainId();
    const [, user1, user2] = await hre.ethers.getSigners();
    users = [user1, user2];
    service = new compoundv3.Service(chainId, hre.ethers.provider);
    await claimToken(chainId, user1.address, compoundv3.mainnetTokens.WETH, '100');
    await claimToken(chainId, user1.address, compoundv3.mainnetTokens.USDC, '1000');
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      ownerIndex: 0,
      claimerIndex: 0,
      marketId: compoundv3.MarketId.USDC,
      supply: new common.TokenAmount(compoundv3.mainnetTokens.WETH, '1'),
      borrow: new common.TokenAmount(compoundv3.mainnetTokens.USDC, '100'),
    },
    {
      ownerIndex: 0,
      claimerIndex: 1,
      marketId: compoundv3.MarketId.USDC,
      supply: new common.TokenAmount(compoundv3.mainnetTokens.WETH, '1'),
      borrow: new common.TokenAmount(compoundv3.mainnetTokens.USDC, '100'),
    },
    {
      ownerIndex: 0,
      claimerIndex: 0,
      marketId: compoundv3.MarketId.ETH,
      supply: new common.TokenAmount(compoundv3.mainnetTokens.WETH, '10'),
    },
    {
      ownerIndex: 0,
      claimerIndex: 1,
      marketId: compoundv3.MarketId.ETH,
      supply: new common.TokenAmount(compoundv3.mainnetTokens.WETH, '10'),
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

      // 2. get rewards amount after 10000 blocks
      await hrehelpers.mine(10000);
      const compoundV3ClaimLogic = new compoundv3.ClaimLogic(chainId, hre.ethers.provider);
      const { output } = await compoundV3ClaimLogic.quote({ marketId, owner: owner.address });
      expect(output.amountWei).to.be.gt(0);

      const routerKit = new core.RouterKit(chainId);

      // 3. allow agent help user to claim
      const tokensReturn = [];
      if (claimer.address === owner.address) {
        await helpers.allow(chainId, claimer, marketId);
        const agent = await routerKit.calcAgent(claimer.address);
        const isAllowed = await service.isAllowed(marketId, claimer.address, agent);
        expect(isAllowed).to.be.true;
        tokensReturn.push(output.token.elasticAddress);
      }

      // 4. build router logics
      const routerLogics: core.DataType.LogicStruct[] = [];
      routerLogics.push(
        await compoundV3ClaimLogic.build({ marketId, owner: owner.address, output }, { account: claimer.address })
      );

      // 5. send router tx
      const transactionRequest = routerKit.buildExecuteTransactionRequest({ routerLogics, tokensReturn });
      await expect(claimer.sendTransaction(transactionRequest)).to.not.be.reverted;
      await expect(owner.address).to.changeBalance(output.token, output.amount, 1);
    });
  });
});

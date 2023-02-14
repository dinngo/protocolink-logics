import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as core from 'src/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';
import * as hrehelpers from '@nomicfoundation/hardhat-network-helpers';
import * as protocols from 'src/protocols';
import * as rt from 'src/router';
import * as utils from 'test/utils';

describe('Test CompoundV2 ClaimCOMP Logic', function () {
  let chainId: number;
  let router: rt.contracts.Router;
  let users: SignerWithAddress[];
  let snapshotId: string;

  before(async function () {
    chainId = await utils.network.getChainId();
    const [, user1, user2] = await hre.ethers.getSigners();
    users = [user1, user2];
    router = await utils.deployer.deployRouter();
    await utils.faucet.claim(new core.tokens.TokenAmount(core.tokens.mainnet.ETH, '100'), user1.address);
    await utils.faucet.claim(new core.tokens.TokenAmount(core.tokens.mainnet.USDC, '5000'), user1.address);
    await utils.faucet.claim(new core.tokens.TokenAmount(core.tokens.mainnet.ETH, '100'), user2.address);
  });

  after(async function () {
    await utils.network.reset();
  });

  beforeEach(async function () {
    snapshotId = await utils.network.takeSnapshot();
  });

  afterEach(async function () {
    await utils.network.restoreSnapshot(snapshotId);
  });

  const cases = [
    {
      holderIndex: 0,
      claimerIndex: 0,
      supply: new core.tokens.TokenAmount(protocols.compoundv2.tokens.underlyingTokens.ETH, '1'),
      borrow: new core.tokens.TokenAmount(protocols.compoundv2.tokens.underlyingTokens.USDC, '100'),
    },
    {
      holderIndex: 0,
      claimerIndex: 0,
      supply: new core.tokens.TokenAmount(protocols.compoundv2.tokens.underlyingTokens.USDC, '3000'),
      borrow: new core.tokens.TokenAmount(protocols.compoundv2.tokens.underlyingTokens.ETH, '1'),
    },
    {
      holderIndex: 0,
      claimerIndex: 1,
      supply: new core.tokens.TokenAmount(protocols.compoundv2.tokens.underlyingTokens.ETH, '1'),
      borrow: new core.tokens.TokenAmount(protocols.compoundv2.tokens.underlyingTokens.USDC, '100'),
    },
    {
      holderIndex: 0,
      claimerIndex: 0,
      supply: new core.tokens.TokenAmount(protocols.compoundv2.tokens.underlyingTokens.USDC, '3000'),
      borrow: new core.tokens.TokenAmount(protocols.compoundv2.tokens.underlyingTokens.ETH, '1'),
    },
  ];

  cases.forEach(({ holderIndex, claimerIndex, supply, borrow }, i) => {
    it(`case ${i + 1}`, async function () {
      const holder = users[holderIndex];
      const claimer = users[claimerIndex];

      // 1. supply, enterMarkets and borrow first
      await helpers.supply(holder, supply);
      await helpers.enterMarkets(holder, [supply.token]);
      await helpers.borrow(holder, borrow);

      // 2. get allocated COMP amount after 1000 blocks
      await hrehelpers.mine(1000);
      const compoundV2ClaimCOMP = new protocols.compoundv2.CompoundV2ClaimCOMPLogic({
        chainId,
        provider: hre.ethers.provider,
      });
      const output = await compoundV2ClaimCOMP.getPrice({ holder: holder.address });
      expect(output.amountWei).to.be.gt(0);

      // 4. build tokensReturn
      const tokensReturn = [output.token.address];

      // 5. build router logics
      const logics: rt.IRouter.LogicStruct[] = [];

      logics.push(await compoundV2ClaimCOMP.getLogic({ holder: holder.address }));

      // 6. send router tx
      await expect(router.connect(claimer).execute(logics, tokensReturn)).not.to.be.reverted;
      await expect(holder.address).to.changeBalance(output.token, output.amount, 1);
    });
  });
});

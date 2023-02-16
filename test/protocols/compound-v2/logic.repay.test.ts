import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as core from 'src/core';
import { expect } from 'chai';
import * as helpers from './helpers';
import hre from 'hardhat';
import * as hrehelpers from '@nomicfoundation/hardhat-network-helpers';
import * as protocols from 'src/protocols';
import * as rt from 'src/router';
import * as utils from 'test/utils';

describe('Test CompoundV2 Repay Logic', function () {
  let chainId: number;
  let router: rt.contracts.Router;
  let erc20Spender: protocols.router.contracts.SpenderPermit2ERC20;
  let user: SignerWithAddress;
  let snapshotId: string;

  before(async function () {
    chainId = await utils.network.getChainId();
    [, user] = await hre.ethers.getSigners();
    router = await utils.deployer.deployRouter();
    erc20Spender = await utils.deployer.deploySpenderPermit2ERC20(
      router.address,
      protocols.router.config.getContractAddress(chainId, 'Permit2')
    );
    await utils.faucet.claim(new core.tokens.TokenAmount(core.tokens.mainnet.ETH, '100'), user.address);
    await utils.faucet.claim(new core.tokens.TokenAmount(core.tokens.mainnet.USDC, '5000'), user.address);
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
      supply: new core.tokens.TokenAmount(protocols.compoundv2.tokens.underlyingTokens.ETH, '1'),
      borrow: new core.tokens.TokenAmount(protocols.compoundv2.tokens.underlyingTokens.USDC, '100'),
    },
    {
      supply: new core.tokens.TokenAmount(protocols.compoundv2.tokens.underlyingTokens.USDC, '3000'),
      borrow: new core.tokens.TokenAmount(protocols.compoundv2.tokens.underlyingTokens.ETH, '1'),
    },
    {
      supply: new core.tokens.TokenAmount(protocols.compoundv2.tokens.underlyingTokens.ETH, '1'),
      borrow: new core.tokens.TokenAmount(protocols.compoundv2.tokens.underlyingTokens.USDC, '100'),
      amountBps: 5000,
    },
    {
      supply: new core.tokens.TokenAmount(protocols.compoundv2.tokens.underlyingTokens.USDC, '3000'),
      borrow: new core.tokens.TokenAmount(protocols.compoundv2.tokens.underlyingTokens.ETH, '1'),
      amountBps: 5000,
    },
  ];

  cases.forEach(({ supply, borrow, amountBps }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. supply, enterMarkets and borrow first
      await helpers.supply(user, supply);
      await helpers.enterMarkets(user, [supply.token]);
      await helpers.borrow(user, borrow);

      // 2. get borrow balance after 1000 blocks
      await hrehelpers.mine(1000);
      const compoundV2Repay = new protocols.compoundv2.CompoundV2RepayLogic({ chainId, provider: hre.ethers.provider });
      const debt = await compoundV2Repay.getDebt(user.address, borrow.token);
      expect(debt.amountWei).to.gt(borrow.amountWei);

      // 3. build input, funds, tokensReturn
      const input = debt;
      const funds = new core.tokens.TokenAmounts();
      if (amountBps) {
        funds.add(utils.router.calcRequiredFundByAmountBps(input, amountBps));
      } else {
        funds.add(input);
      }
      const tokensReturn = [input.token.elasticAddress];

      // 4. build router logics
      const erc20Funds = funds.erc20;
      const logics = await utils.router.getPermitAndPullTokenLogics(
        chainId,
        user,
        erc20Funds,
        router.address,
        erc20Spender.address
      );

      logics.push(await compoundV2Repay.getLogic({ input, amountBps, borrower: user.address }));

      // 5. send router tx
      const value = funds.native?.amountWei ?? 0;
      await expect(router.connect(user).execute(logics, tokensReturn, { value })).not.to.be.reverted;
      await expect(user.address).to.changeBalance(input.token, -input.amount, 1);
    });
  });
});
